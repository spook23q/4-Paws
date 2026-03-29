import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

interface PaymentItem {
  id: number;
  bookingId: number;
  amount: number;
  status: string;
  createdAt: Date;
  sitterName?: string;
  ownerName?: string;
}

export default function PaymentsScreen() {
  const colors = useColors();
  const { user } = useAuth();
  
  // Fetch bookings with payment information
  const { data: bookings, isLoading } = trpc.bookings.getMyBookings.useQuery({});

  // Filter bookings that have payments
  const paymentsData: PaymentItem[] = (bookings || [])
    .filter((booking: any) => booking.paymentIntentId)
    .map((booking: any) => ({
      id: Number(booking.id),
      bookingId: Number(booking.id),
      amount: parseFloat(booking.totalPrice),
      status: booking.status,
      createdAt: booking.createdAt,
      sitterName: booking.sitterName,
      ownerName: booking.ownerName,
    }))
    .sort((a: PaymentItem, b: PaymentItem) => b.createdAt.getTime() - a.createdAt.getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#22C55E";
      case "completed":
        return "#3B82F6";
      case "pending":
        return "#F59E0B";
      case "cancelled":
        return "#EF4444";
      default:
        return colors.muted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Paid";
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const renderPaymentItem = ({ item }: { item: PaymentItem }) => {
    const isOwner = user?.role === "owner";
    const otherPartyName = isOwner ? item.sitterName : item.ownerName;

    return (
      <TouchableOpacity
        className="bg-surface rounded-2xl p-4 mb-3 border border-border"
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground mb-1">
              {isOwner ? "Payment to" : "Payment from"} {otherPartyName}
            </Text>
            <Text className="text-sm text-muted">
              {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </Text>
          </View>
          <View>
            <Text className="text-xl font-bold text-primary">
              ${item.amount.toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border">
          <Text className="text-sm text-muted">
            Booking #{item.bookingId}
          </Text>
          <View
            style={{ backgroundColor: getStatusColor(item.status) }}
            className="px-3 py-1 rounded-full"
          >
            <Text className="text-xs font-semibold text-white">
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-bold text-foreground mb-2">
          Payment History
        </Text>
        <Text className="text-base text-muted">
          {user?.role === "owner" 
            ? "Track your booking payments" 
            : "View payments received from bookings"}
        </Text>
      </View>

      {/* Payment List */}
      {paymentsData.length === 0 ? (
        <View className="flex-1 justify-center items-center py-12">
          <Text className="text-6xl mb-4">💳</Text>
          <Text className="text-xl font-semibold text-foreground mb-2">
            No Payments Yet
          </Text>
          <Text className="text-base text-muted text-center px-8">
            {user?.role === "owner"
              ? "Your payment history will appear here after you book a sitter"
              : "Payment history will appear here when you receive bookings"}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={paymentsData}
            renderItem={renderPaymentItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          {/* Payment Provider Logos */}
          <View className="items-center mt-6 pt-6 border-t border-border">
            <Text className="text-xs text-muted mb-3">Secured by</Text>
            <View className="flex-row items-center gap-4">
              <Image
                source={require("@/assets/images/payment/stripe-logo.png")}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
              <Image
                source={require("@/assets/images/payment/visa-mastercard.png")}
                style={{ width: 70, height: 23 }}
                resizeMode="contain"
              />
            </View>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
