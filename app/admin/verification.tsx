import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Platform,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Linking,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

type FilterStatus = "all" | "pending" | "verified" | "rejected" | "expired";

interface DocumentItem {
  id: string;
  userId: string;
  documentType: string;
  documentTypeLabel: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  referenceNumber: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  notes: string | null;
  verificationStatus: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  sitterName: string;
  sitterEmail: string;
  sitterPhone: string | null;
  sitterPhoto: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#F59E0B20", text: "#F59E0B", label: "Pending" },
  verified: { bg: "#22C55E20", text: "#22C55E", label: "Verified" },
  rejected: { bg: "#EF444420", text: "#EF4444", label: "Rejected" },
  expired: { bg: "#6B728020", text: "#6B7280", label: "Expired" },
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-AU");
}

export default function AdminVerificationScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check admin access
  const adminCheck = trpc.admin.isAdmin.useQuery();

  // Get stats
  const stats = trpc.admin.getStats.useQuery(undefined, {
    enabled: adminCheck.data?.isAdmin === true,
  });

  // Get documents
  const documents = trpc.admin.listDocuments.useQuery(
    { status: filterStatus, limit: 50, offset: 0 },
    { enabled: adminCheck.data?.isAdmin === true }
  );

  // Mutations
  const verifyMutation = trpc.admin.verifyDocument.useMutation({
    onSuccess: () => {
      documents.refetch();
      stats.refetch();
      setSelectedDoc(null);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
  });

  const rejectMutation = trpc.admin.rejectDocument.useMutation({
    onSuccess: () => {
      documents.refetch();
      stats.refetch();
      setSelectedDoc(null);
      setShowRejectModal(false);
      setRejectionReason("");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
  });

  const expireMutation = trpc.admin.expireDocument.useMutation({
    onSuccess: () => {
      documents.refetch();
      stats.refetch();
      setSelectedDoc(null);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
  });

  const checkExpiringMutation = trpc.admin.checkExpiringDocuments.useMutation({
    onSuccess: (result) => {
      Alert.alert(
        "Expiry Check Complete",
        `Checked ${result.totalChecked} documents.\n${result.notifiedCount} sitters notified of upcoming expiry.\n${result.expiredCount} documents marked as expired.`
      );
      documents.refetch();
      stats.refetch();
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([documents.refetch(), stats.refetch()]);
    setRefreshing(false);
  }, [documents, stats]);

  const handleVerify = (doc: DocumentItem) => {
    Alert.alert(
      "Verify Document",
      `Verify ${doc.documentTypeLabel} from ${doc.sitterName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: () => verifyMutation.mutate({ id: doc.id }),
        },
      ]
    );
  };

  const handleReject = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleSubmitRejection = () => {
    if (!selectedDoc || !rejectionReason.trim()) {
      Alert.alert("Error", "Please provide a rejection reason.");
      return;
    }
    rejectMutation.mutate({ id: selectedDoc.id, reason: rejectionReason.trim() });
  };

  const handleExpire = (doc: DocumentItem) => {
    Alert.alert(
      "Mark as Expired",
      `Mark ${doc.documentTypeLabel} from ${doc.sitterName} as expired?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Expired",
          style: "destructive",
          onPress: () => expireMutation.mutate({ id: doc.id }),
        },
      ]
    );
  };

  const handleViewFile = (url: string) => {
    Linking.openURL(url);
  };

  // Not admin
  if (adminCheck.data && !adminCheck.data.isAdmin) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-6">
        <View className="flex-1 items-center justify-center">
          <IconSymbol name="lock.fill" size={48} color={colors.muted} />
          <Text className="text-xl font-bold text-foreground mt-4">Access Denied</Text>
          <Text className="text-muted text-center mt-2">
            You need admin privileges to access this panel.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const filterTabs: { key: FilterStatus; label: string; count?: number }[] = [
    { key: "pending", label: "Pending", count: stats.data?.pending },
    { key: "all", label: "All", count: stats.data?.totalDocuments },
    { key: "verified", label: "Verified", count: stats.data?.verified },
    { key: "rejected", label: "Rejected", count: stats.data?.rejected },
    { key: "expired", label: "Expired", count: stats.data?.expired },
  ];

  const renderDocument = ({ item }: { item: DocumentItem }) => {
    const statusInfo = STATUS_COLORS[item.verificationStatus] || STATUS_COLORS.pending;

    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
              <Text style={styles.avatarText}>
                {item.sitterName?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={[styles.sitterName, { color: colors.foreground }]}>
                {item.sitterName}
              </Text>
              <Text style={[styles.sitterEmail, { color: colors.muted }]}>
                {item.sitterEmail}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Document Info */}
        <View style={[styles.docInfo, { borderTopColor: colors.border }]}>
          <View style={styles.docRow}>
            <Text style={[styles.docLabel, { color: colors.muted }]}>Document</Text>
            <Text style={[styles.docValue, { color: colors.foreground }]}>
              {item.documentTypeLabel}
            </Text>
          </View>
          <View style={styles.docRow}>
            <Text style={[styles.docLabel, { color: colors.muted }]}>File</Text>
            <Text style={[styles.docValue, { color: colors.foreground }]} numberOfLines={1}>
              {item.fileName} ({formatFileSize(item.fileSize)})
            </Text>
          </View>
          {item.referenceNumber && (
            <View style={styles.docRow}>
              <Text style={[styles.docLabel, { color: colors.muted }]}>Reference</Text>
              <Text style={[styles.docValue, { color: colors.foreground }]}>
                {item.referenceNumber}
              </Text>
            </View>
          )}
          {item.issueDate && (
            <View style={styles.docRow}>
              <Text style={[styles.docLabel, { color: colors.muted }]}>Issued</Text>
              <Text style={[styles.docValue, { color: colors.foreground }]}>
                {item.issueDate}
              </Text>
            </View>
          )}
          {item.expiryDate && (
            <View style={styles.docRow}>
              <Text style={[styles.docLabel, { color: colors.muted }]}>Expires</Text>
              <Text style={[styles.docValue, { color: colors.foreground }]}>
                {item.expiryDate}
              </Text>
            </View>
          )}
          {item.rejectionReason && (
            <View style={styles.docRow}>
              <Text style={[styles.docLabel, { color: colors.error }]}>Reason</Text>
              <Text style={[styles.docValue, { color: colors.error }]}>
                {item.rejectionReason}
              </Text>
            </View>
          )}
          <View style={styles.docRow}>
            <Text style={[styles.docLabel, { color: colors.muted }]}>Uploaded</Text>
            <Text style={[styles.docValue, { color: colors.muted }]}>
              {timeAgo(item.createdAt)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => handleViewFile(item.fileUrl)}
            style={[styles.actionBtn, { backgroundColor: `${colors.primary}15` }]}
          >
            <IconSymbol name="doc.text.fill" size={16} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>View</Text>
          </TouchableOpacity>

          {item.verificationStatus === "pending" && (
            <>
              <TouchableOpacity
                onPress={() => handleVerify(item)}
                style={[styles.actionBtn, { backgroundColor: "#22C55E15" }]}
              >
                <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
                <Text style={[styles.actionText, { color: "#22C55E" }]}>Verify</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleReject(item)}
                style={[styles.actionBtn, { backgroundColor: "#EF444415" }]}
              >
                <IconSymbol name="xmark" size={16} color="#EF4444" />
                <Text style={[styles.actionText, { color: "#EF4444" }]}>Reject</Text>
              </TouchableOpacity>
            </>
          )}

          {item.verificationStatus === "verified" && (
            <TouchableOpacity
              onPress={() => handleExpire(item)}
              style={[styles.actionBtn, { backgroundColor: "#F59E0B15" }]}
            >
              <IconSymbol name="clock.badge.exclamationmark" size={16} color="#F59E0B" />
              <Text style={[styles.actionText, { color: "#F59E0B" }]}>Expire</Text>
            </TouchableOpacity>
          )}

          {item.verificationStatus === "rejected" && (
            <TouchableOpacity
              onPress={() => handleVerify(item)}
              style={[styles.actionBtn, { backgroundColor: "#22C55E15" }]}
            >
              <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
              <Text style={[styles.actionText, { color: "#22C55E" }]}>Re-verify</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-0">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackBtn}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Admin Verification
        </Text>
        <TouchableOpacity
          onPress={() => checkExpiringMutation.mutate()}
          style={[styles.headerActionBtn, { backgroundColor: `${colors.primary}15` }]}
          disabled={checkExpiringMutation.isPending}
        >
          <IconSymbol name="clock.badge.exclamationmark" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      {stats.data && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          <View style={[styles.statCard, { backgroundColor: "#F59E0B15" }]}>
            <Text style={[styles.statNumber, { color: "#F59E0B" }]}>{stats.data.pending}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#22C55E15" }]}>
            <Text style={[styles.statNumber, { color: "#22C55E" }]}>{stats.data.verified}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Verified</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#EF444415" }]}>
            <Text style={[styles.statNumber, { color: "#EF4444" }]}>{stats.data.rejected}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Rejected</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#3B82F615" }]}>
            <Text style={[styles.statNumber, { color: "#3B82F6" }]}>{stats.data.compliantSitters}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Compliant</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#F59E0B15" }]}>
            <Text style={[styles.statNumber, { color: "#F59E0B" }]}>{stats.data.expiringSoon}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Expiring</Text>
          </View>
        </ScrollView>
      )}

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              setFilterStatus(tab.key);
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={[
              styles.filterTab,
              {
                backgroundColor:
                  filterStatus === tab.key ? colors.primary : colors.surface,
                borderColor: filterStatus === tab.key ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color: filterStatus === tab.key ? "#FFFFFF" : colors.foreground,
                },
              ]}
            >
              {tab.label}
              {tab.count !== undefined ? ` (${tab.count})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Document List */}
      <FlatList
        data={documents.data?.documents || []}
        keyExtractor={(item) => item.id}
        renderItem={renderDocument}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="doc.text.fill" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No Documents
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              {filterStatus === "pending"
                ? "No documents awaiting verification."
                : `No ${filterStatus} documents found.`}
            </Text>
          </View>
        }
      />

      {/* Rejection Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Reject Document
            </Text>
            {selectedDoc && (
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                {selectedDoc.documentTypeLabel} from {selectedDoc.sitterName}
              </Text>
            )}
            <TextInput
              style={[
                styles.reasonInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Reason for rejection (required)..."
              placeholderTextColor={colors.muted}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowRejectModal(false)}
                style={[styles.modalBtn, { backgroundColor: colors.surface }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitRejection}
                style={[styles.modalBtn, { backgroundColor: "#EF4444" }]}
                disabled={rejectMutation.isPending}
              >
                <Text style={[styles.modalBtnText, { color: "#FFFFFF" }]}>
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerBackBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
  },
  headerActionBtn: {
    padding: 8,
    borderRadius: 8,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardHeaderInfo: {
    flex: 1,
  },
  sitterName: {
    fontSize: 15,
    fontWeight: "600",
  },
  sitterEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  docInfo: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 0.5,
  },
  docRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  docLabel: {
    fontSize: 13,
    fontWeight: "500",
    width: 80,
  },
  docValue: {
    fontSize: 13,
    flex: 1,
    textAlign: "right",
  },
  actions: {
    flexDirection: "row",
    padding: 10,
    gap: 8,
    borderTopWidth: 0.5,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
