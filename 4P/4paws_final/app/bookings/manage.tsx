import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export default function SitterBookingManagementScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"pending" | "upcoming" | "past">("pending");

  const { data: bookings, refetch } = trpc.bookings.getMyBookings.useQuery({}, {
    enabled: !!user && user.role === "sitter",
  });

  const acceptBookingMutation = trpc.bookings.accept.useMutation();
  const declineBookingMutation = trpc.bookings.decline.useMutation();

  const handleAcceptBooking = async (bookingId: string) => {
    Alert.alert(
      "Accept Booking",
      "Are you sure you want to accept this booking request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: async () => {
            try {
              await acceptBookingMutation.mutateAsync({ id: bookingId });
              Alert.alert("Success", "Booking accepted! The owner has been notified.");
              refetch();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to accept booking");
            }
          },
        },
      ]
    );
  };

  const handleDeclineBooking = async (bookingId: string) => {
    Alert.alert(
      "Decline Booking",
      "Are you sure you want to decline this booking request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              await declineBookingMutation.mutateAsync({ id: bookingId });
              Alert.alert("Declined", "Booking declined. The owner has been notified.");
              refetch();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to decline booking");
            }
          },
        },
      ]
    );
  };

  if (!user || user.role !== "sitter") {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            Sitter Account Required
          </Text>
          <Text className="text-base text-muted text-center mb-6">
            This page is only accessible to cat sitters
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const pendingBookings = bookings?.filter((b: any) => b.status === "pending") || [];
  const upcomingBookings = bookings?.filter((b: any) => b.status === "confirmed") || [];
  const pastBookings = bookings?.filter((b: any) => ["completed", "cancelled"].includes(b.status)) || [];

  const renderBooking = (booking: any) => {
    const startDate = new Date(booking.startDate).toLocaleDateString();
    const endDate = new Date(booking.endDate).toLocaleDateString();
    const catIds = JSON.parse(booking.catIds || "[]");

    return (
      <View
        key={booking.id}
        className="bg-surface rounded-2xl p-5 mb-4 border border-border"
      >
        {/* Owner Info */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground mb-1">
              {booking.ownerName || "Cat Owner"}
            </Text>
            <Text className="text-sm text-muted">{booking.ownerSuburb || "Sydney"}</Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              booking.status === "pending"
                ? "bg-warning/20"
                : booking.status === "confirmed"
                ? "bg-success/20"
                : booking.status === "completed"
                ? "bg-primary/20"
                : "bg-error/20"
            }`}
          >
            <Text
              className={`text-xs font-semibold capitalize ${
                booking.status === "pending"
                  ? "text-warning"
                  : booking.status === "confirmed"
                  ? "text-success"
                  : booking.status === "completed"
                  ? "text-primary"
                  : "text-error"
              }`}
            >
              {booking.status}
            </Text>
          </View>
        </View>

        {/* Booking Details */}
        <View className="bg-background rounded-xl p-4 mb-3">
          <View className="flex-row items-center mb-2">
            <IconSymbol name="clock.fill" size={16} color={colors.muted} />
            <Text className="text-sm text-foreground ml-2">
              {startDate} - {endDate}
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <IconSymbol name="clock.fill" size={16} color={colors.muted} />
            <Text className="text-sm text-foreground ml-2">
              {booking.startTime} - {booking.endTime}
            </Text>
          </View>
          <View className="flex-row items-center">
            <IconSymbol name="heart.fill" size={16} color={colors.muted} />
            <Text className="text-sm text-foreground ml-2">
              {catIds.length} {catIds.length === 1 ? "cat" : "cats"}
            </Text>
          </View>
        </View>

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <View className="bg-primary/10 rounded-xl p-3 mb-3">
            <Text className="text-xs font-semibold text-foreground mb-1">
              Special Instructions
            </Text>
            <Text className="text-sm text-foreground">{booking.specialInstructions}</Text>
          </View>
        )}

        {/* Price */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base text-muted">Total Payment</Text>
          <Text className="text-2xl font-bold text-primary">${booking.totalPrice}</Text>
        </View>

        {/* Actions for Pending Bookings */}
        {booking.status === "pending" && (
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-success rounded-xl py-3 items-center"
              onPress={() => handleAcceptBooking(booking.id.toString())}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-error/10 border border-error rounded-xl py-3 items-center"
              onPress={() => handleDeclineBooking(booking.id.toString())}
              activeOpacity={0.8}
            >
              <Text className="text-error font-semibold">Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* View Details Button for Confirmed/Past */}
        {booking.status !== "pending" && (
          <TouchableOpacity
            className="bg-primary rounded-xl py-3 items-center"
            onPress={() => router.push(`/bookings/${booking.id}` as any)}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground ml-4">
              Manage Bookings
            </Text>
          </View>

          {/* Tabs */}
          <View className="flex-row bg-surface rounded-2xl p-2 mb-6">
            <TouchableOpacity
              className={`flex-1 rounded-xl py-3 items-center ${
                activeTab === "pending" ? "bg-primary" : ""
              }`}
              onPress={() => setActiveTab("pending")}
              activeOpacity={0.7}
            >
              <Text
                className={`font-semibold ${
                  activeTab === "pending" ? "text-white" : "text-muted"
                }`}
              >
                Pending ({pendingBookings.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-xl py-3 items-center ${
                activeTab === "upcoming" ? "bg-primary" : ""
              }`}
              onPress={() => setActiveTab("upcoming")}
              activeOpacity={0.7}
            >
              <Text
                className={`font-semibold ${
                  activeTab === "upcoming" ? "text-white" : "text-muted"
                }`}
              >
                Upcoming ({upcomingBookings.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-xl py-3 items-center ${
                activeTab === "past" ? "bg-primary" : ""
              }`}
              onPress={() => setActiveTab("past")}
              activeOpacity={0.7}
            >
              <Text
                className={`font-semibold ${
                  activeTab === "past" ? "text-white" : "text-muted"
                }`}
              >
                Past ({pastBookings.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bookings List */}
          {activeTab === "pending" && (
            <View>
              {pendingBookings.length > 0 ? (
                pendingBookings.map(renderBooking)
              ) : (
                <View className="items-center py-20">
                  <Text className="text-xl font-bold text-foreground mb-2">
                    No Pending Requests
                  </Text>
                  <Text className="text-base text-muted text-center">
                    You'll see new booking requests here
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === "upcoming" && (
            <View>
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map(renderBooking)
              ) : (
                <View className="items-center py-20">
                  <Text className="text-xl font-bold text-foreground mb-2">
                    No Upcoming Bookings
                  </Text>
                  <Text className="text-base text-muted text-center">
                    Accepted bookings will appear here
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === "past" && (
            <View>
              {pastBookings.length > 0 ? (
                pastBookings.map(renderBooking)
              ) : (
                <View className="items-center py-20">
                  <Text className="text-xl font-bold text-foreground mb-2">
                    No Past Bookings
                  </Text>
                  <Text className="text-base text-muted text-center">
                    Completed bookings will appear here
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
