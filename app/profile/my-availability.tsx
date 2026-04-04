import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import { useState, useMemo, useCallback } from "react";
import * as Haptics from "expo-haptics";

import { useScreenLayout } from "@/hooks/use-screen-layout";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type DateStatus = "available" | "unavailable" | null;

export default function MyAvailabilityScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const { user } = useAuth();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState<"available" | "unavailable">("available");

  // Fetch availability for the current month
  const {
    data: monthData,
    isLoading,
    refetch,
  } = trpc.availability.getMyMonth.useQuery(
    { year: currentYear, month: currentMonth },
    { enabled: !!user && user.role === "sitter" }
  );

  const setDatesMutation = trpc.availability.setDates.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedDates(new Set());
    },
  });

  const removeDatesMutation = trpc.availability.removeDates.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedDates(new Set());
    },
  });

  // Build a map of date -> status from server data
  const dateStatusMap = useMemo(() => {
    const map = new Map<string, DateStatus>();
    if (monthData) {
      for (const row of monthData) {
        map.set(row.date, row.status as DateStatus);
      }
    }
    return map;
  }, [monthData]);

  // Calendar grid computation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();

    // Monday = 0, Sunday = 6 (ISO week)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: (number | null)[] = [];
    // Leading empty cells
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    // Trailing empty cells to fill last row
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentYear, currentMonth]);

  const monthName = useMemo(() => {
    return new Date(currentYear, currentMonth - 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }, [currentYear, currentMonth]);

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDates(new Set());
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDates(new Set());
  };

  const formatDateStr = (day: number) => {
    return `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const isPastDate = (day: number) => {
    const dateStr = formatDateStr(day);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return dateStr < todayStr;
  };

  const handleDayPress = useCallback(
    (day: number) => {
      if (isPastDate(day)) return;

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const dateStr = formatDateStr(day);
      setSelectedDates((prev) => {
        const next = new Set(prev);
        if (next.has(dateStr)) {
          next.delete(dateStr);
        } else {
          next.add(dateStr);
        }
        return next;
      });
    },
    [currentYear, currentMonth]
  );

  const handleApply = async () => {
    if (selectedDates.size === 0) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await setDatesMutation.mutateAsync({
        dates: Array.from(selectedDates),
        status: selectionMode,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(
        "Updated",
        `${selectedDates.size} date(s) marked as ${selectionMode}`
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update availability");
    }
  };

  const handleClearSelected = async () => {
    if (selectedDates.size === 0) return;

    Alert.alert(
      "Clear Dates",
      `Remove availability status for ${selectedDates.size} selected date(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await removeDatesMutation.mutateAsync({
                dates: Array.from(selectedDates),
              });
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to clear dates");
            }
          },
        },
      ]
    );
  };

  if (!user || user.role !== "sitter") {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "600" }}>
            Only sitters can manage availability
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const getDayCellStyle = (day: number) => {
    const dateStr = formatDateStr(day);
    const isSelected = selectedDates.has(dateStr);
    const status = dateStatusMap.get(dateStr);
    const isPast = isPastDate(day);

    let bgColor = "transparent";
    let textColor = colors.foreground;
    let borderColor = "transparent";

    if (isPast) {
      textColor = `${colors.muted}60`;
    } else if (isSelected) {
      bgColor = selectionMode === "available" ? `${colors.success}30` : `${colors.error}30`;
      borderColor = selectionMode === "available" ? colors.success : colors.error;
      textColor = colors.foreground;
    } else if (status === "available") {
      bgColor = `${colors.success}20`;
      textColor = colors.success;
    } else if (status === "unavailable") {
      bgColor = `${colors.error}15`;
      textColor = colors.error;
    }

    // Today highlight
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const isToday = dateStr === todayStr;

    return { bgColor, textColor, borderColor, isToday, isSelected, status, isPast };
  };

  const availableCount = monthData?.filter((d) => d.status === "available").length ?? 0;
  const unavailableCount = monthData?.filter((d) => d.status === "unavailable").length ?? 0;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            My Availability
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Month Summary */}
          <View style={[styles.summaryRow, { borderColor: colors.border }]}>
            <View style={[styles.summaryItem, { backgroundColor: `${colors.success}15` }]}>
              <Text style={[styles.summaryCount, { color: colors.success }]}>
                {availableCount}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.success }]}>
                Available
              </Text>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: `${colors.error}10` }]}>
              <Text style={[styles.summaryCount, { color: colors.error }]}>
                {unavailableCount}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.error }]}>
                Unavailable
              </Text>
            </View>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={goToPrevMonth} activeOpacity={0.7} style={styles.monthNavBtn}>
              <IconSymbol name="chevron.left" size={22} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: colors.foreground }]}>
              {monthName}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} activeOpacity={0.7} style={styles.monthNavBtn}>
              <IconSymbol name="chevron.right" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Day of Week Headers */}
          <View style={styles.weekRow}>
            {DAYS_OF_WEEK.map((day) => (
              <View key={day} style={styles.weekCell}>
                <Text style={[styles.weekDayText, { color: colors.muted }]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const cellStyle = getDayCellStyle(day);

                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                      styles.dayCell,
                      {
                        backgroundColor: cellStyle.bgColor,
                        borderColor: cellStyle.borderColor,
                        borderWidth: cellStyle.isSelected ? 2 : 0,
                      },
                      cellStyle.isToday && [styles.todayCell, { borderColor: colors.primary }],
                    ]}
                    onPress={() => handleDayPress(day)}
                    activeOpacity={cellStyle.isPast ? 1 : 0.6}
                    disabled={cellStyle.isPast}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: cellStyle.textColor },
                        cellStyle.isToday && { fontWeight: "800" },
                      ]}
                    >
                      {day}
                    </Text>
                    {cellStyle.status && !cellStyle.isPast && (
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              cellStyle.status === "available"
                                ? colors.success
                                : colors.error,
                          },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Legend */}
          <View style={[styles.legend, { borderColor: colors.border }]}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.legendText, { color: colors.muted }]}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={[styles.legendText, { color: colors.muted }]}>Unavailable</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.muted, opacity: 0.3 }]} />
              <Text style={[styles.legendText, { color: colors.muted }]}>Not set</Text>
            </View>
          </View>

          {/* Selection Mode Toggle */}
          <View style={[styles.modeSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modeSectionTitle, { color: colors.foreground }]}>
              Tap dates to select, then apply:
            </Text>
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  {
                    backgroundColor:
                      selectionMode === "available" ? colors.success : "transparent",
                    borderColor: colors.success,
                  },
                ]}
                onPress={() => {
                  setSelectionMode("available");
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={18}
                  color={selectionMode === "available" ? "#FFFFFF" : colors.success}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    {
                      color: selectionMode === "available" ? "#FFFFFF" : colors.success,
                    },
                  ]}
                >
                  Available
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  {
                    backgroundColor:
                      selectionMode === "unavailable" ? colors.error : "transparent",
                    borderColor: colors.error,
                  },
                ]}
                onPress={() => {
                  setSelectionMode("unavailable");
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name="xmark"
                  size={18}
                  color={selectionMode === "unavailable" ? "#FFFFFF" : colors.error}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    {
                      color: selectionMode === "unavailable" ? "#FFFFFF" : colors.error,
                    },
                  ]}
                >
                  Unavailable
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          {selectedDates.size > 0 && (
            <View style={styles.actionRow}>
              <Text style={[styles.selectedCount, { color: colors.muted }]}>
                {selectedDates.size} date(s) selected
              </Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.clearButton, { borderColor: colors.muted }]}
                  onPress={handleClearSelected}
                  activeOpacity={0.7}
                  disabled={removeDatesMutation.isPending}
                >
                  <Text style={[styles.clearButtonText, { color: colors.muted }]}>
                    Clear
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    {
                      backgroundColor:
                        selectionMode === "available" ? colors.success : colors.error,
                    },
                  ]}
                  onPress={handleApply}
                  activeOpacity={0.8}
                  disabled={setDatesMutation.isPending}
                >
                  {setDatesMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.applyButtonText}>
                      Mark as {selectionMode === "available" ? "Available" : "Unavailable"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tip */}
          <View style={[styles.tipCard, { backgroundColor: `${colors.primary}08`, borderColor: colors.border }]}>
            <IconSymbol name="questionmark.circle.fill" size={20} color={colors.primary} />
            <Text style={[styles.tipText, { color: colors.muted }]}>
              Mark your available dates so cat owners can see when you're free to sit. Dates not marked will appear as unset to owners.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  summaryCount: {
    fontSize: 28,
    fontWeight: "800",
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthNavBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    position: "relative",
  },
  todayCell: {
    borderWidth: 2,
  },
  dayText: {
    fontSize: 15,
    fontWeight: "500",
  },
  statusDot: {
    position: "absolute",
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  loadingContainer: {
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingVertical: 14,
    marginTop: 8,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modeSection: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  modeSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  modeToggle: {
    flexDirection: "row",
    gap: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionRow: {
    marginTop: 16,
  },
  selectedCount: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
