import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { router } from "expo-router";

import { useScreenLayout } from "@/hooks/use-screen-layout";

interface PaymentItem {
  id: number;
  bookingId: number;
  amount: number;
  bookingStatus: string;
  paymentStatus: "paid" | "pending" | "unpaid";
  createdAt: string;
  startDate: string;
  endDate: string;
  sitterName?: string;
  ownerName?: string;
  paymentIntentId?: string;
}

export default function PaymentsScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const { user } = useAuth();

  const { data: bookings, isLoading } = trpc.bookings.getMyBookings.useQuery(
    {},
    { enabled: !!user }
  );

  // Build payment items from bookings
  const paymentsData: PaymentItem[] = (bookings || [])
    .map((booking: any) => {
      let paymentStatus: "paid" | "pending" | "unpaid" = "unpaid";
      if (booking.paymentIntentId) {
        paymentStatus = "paid";
      } else if (booking.status === "confirmed") {
        paymentStatus = "pending";
      }

      return {
        id: Number(booking.id),
        bookingId: Number(booking.id),
        amount: parseFloat(booking.totalPrice),
        bookingStatus: booking.status,
        paymentStatus,
        createdAt: booking.createdAt,
        startDate: booking.startDate,
        endDate: booking.endDate,
        sitterName: booking.sitterName,
        ownerName: booking.ownerName,
        paymentIntentId: booking.paymentIntentId,
      };
    })
    .filter(
      (item: PaymentItem) =>
        item.paymentStatus === "paid" ||
        (item.paymentStatus === "pending" && user?.role === "owner")
    )
    .sort(
      (a: PaymentItem, b: PaymentItem) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const totalPaid = paymentsData
    .filter((p) => p.paymentStatus === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = paymentsData
    .filter((p) => p.paymentStatus === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return colors.success;
      case "pending":
        return colors.warning;
      case "unpaid":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "pending":
        return "Awaiting Payment";
      case "unpaid":
        return "Unpaid";
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderPaymentItem = ({ item }: { item: PaymentItem }) => {
    const isOwner = user?.role === "owner";
    const otherPartyName = isOwner ? item.sitterName : item.ownerName;
    const statusColor = getPaymentStatusColor(item.paymentStatus);

    return (
      <View className="bg-surface rounded-2xl p-4 mb-3 border border-border">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-base font-bold text-foreground mb-1">
              {isOwner ? `Payment to ${otherPartyName}` : `Payment from ${otherPartyName}`}
            </Text>
            <Text className="text-sm text-muted">
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>
          <Text className="text-xl font-bold text-primary">
            ${item.amount.toFixed(2)}
          </Text>
        </View>

        {/* Status and Booking ID */}
        <View className="flex-row items-center justify-between pt-3 border-t border-border">
          <Text className="text-sm text-muted">Booking #{item.bookingId}</Text>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: `${statusColor}20` }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: statusColor }}
            >
              {getPaymentStatusText(item.paymentStatus)}
            </Text>
          </View>
        </View>

        {/* Pay Now button for pending payments */}
        {isOwner && item.paymentStatus === "pending" && (
          <TouchableOpacity
            className="bg-success rounded-xl py-3 mt-3 flex-row items-center justify-center"
            onPress={() =>
              router.push({
                pathname: "/bookings/payment",
                params: {
                  bookingId: item.bookingId.toString(),
                  sitterName: otherPartyName || "",
                  amount: item.amount.toString(),
                },
              } as any)
            }
            activeOpacity={0.8}
          >
            <IconSymbol name="creditcard.fill" size={18} color="white" />
            <Text className="text-white font-bold ml-2">
              Pay Now — ${item.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!user) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">Sign In Required</Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl"
            onPress={() => router.push("/auth/sign-in" as any)}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Payments
          </Text>
          <Text className="text-base text-muted">
            {user.role === "owner"
              ? "Track your booking payments"
              : "View payments received from bookings"}
          </Text>
        </View>

        {/* Summary Cards */}
        {paymentsData.length > 0 && (
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-success/10 rounded-2xl p-4 border border-success/20">
              <Text className="text-sm text-muted mb-1">
                {user.role === "owner" ? "Total Paid" : "Total Received"}
              </Text>
              <Text className="text-2xl font-bold text-success">
                ${totalPaid.toFixed(2)}
              </Text>
            </View>
            {user.role === "owner" && totalPending > 0 && (
              <View className="flex-1 bg-warning/10 rounded-2xl p-4 border border-warning/20">
                <Text className="text-sm text-muted mb-1">Pending</Text>
                <Text className="text-2xl font-bold text-warning">
                  ${totalPending.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Payment List */}
        {paymentsData.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <IconSymbol name="creditcard.fill" size={40} color={colors.primary} />
            </View>
            <Text className="text-xl font-semibold text-foreground mb-2">
              No Payments Yet
            </Text>
            <Text className="text-base text-muted text-center px-8">
              {user.role === "owner"
                ? "Your payment history will appear here after you book and pay a sitter"
                : "Payment history will appear here when you receive bookings"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={paymentsData}
            renderItem={renderPaymentItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListFooterComponent={
              <View className="items-center mt-4 pt-4 border-t border-border">
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="lock.fill" size={14} color={colors.muted} />
                  <Text className="text-xs text-muted">
                    Payments secured by Stripe
                  </Text>
                </View>
              </View>
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}
