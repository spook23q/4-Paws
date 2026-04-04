import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { router } from "expo-router";
import { PaymentMethods } from "@/components/payment-methods";
import { BookingListSkeleton } from "@/components/ui/skeleton";
import { PawLoadingAnimation } from "@/components/ui/loading-spinner";
import { NoBookings } from "@/components/ui/empty-state";
import { useScreenLayout } from "@/hooks/use-screen-layout";

type BookingTab = "upcoming" | "pending" | "past";

export default function BookingsScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");
  const { columns } = useScreenLayout();

  const { data: bookings, isLoading } = trpc.bookings.getMyBookings.useQuery({
    status: activeTab === "upcoming" ? "confirmed" : activeTab === "pending" ? "pending" : "completed",
  }, { enabled: !!user });

  const renderBooking = ({ item }: { item: any }) => {
    const isOwner = user?.role === "owner";
    const otherParty = isOwner ? item.sitterName : item.ownerName;
    const statusColor =
      item.status === "confirmed"
        ? colors.success
        : item.status === "pending"
        ? colors.warning
        : colors.muted;

    const isCompleted = item.status === "completed";
    const canReview = isOwner && isCompleted && !item.hasReview;

    return (
      <TouchableOpacity
        className="bg-surface rounded-2xl p-4 mb-4 border border-border"
        onPress={() => router.push(`/bookings/manage?bookingId=${item.id}` as any)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground mb-1">
              {isOwner ? `Sitter: ${otherParty}` : `Owner: ${otherParty}`}
            </Text>
            <Text className="text-sm text-muted">
              {new Date(item.startDate).toLocaleDateString()} -{" "}
              {new Date(item.endDate).toLocaleDateString()}
            </Text>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: `${statusColor}20` }}
          >
            <Text className="text-xs font-bold capitalize" style={{ color: statusColor }}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View className="flex-row items-center mb-2">
          <IconSymbol name="clock.fill" size={16} color={colors.muted} />
          <Text className="text-sm text-muted ml-2">
            {item.visitType === "overnight" ? "Overnight Stay" : `${item.visitsPerDay} visit(s) per day`}
          </Text>
        </View>

        {/* Pay Now Button for Confirmed Bookings (Owner) */}
        {isOwner && item.status === "confirmed" && !item.paymentIntentId && (
          <TouchableOpacity
            className="bg-success rounded-xl p-3 mb-3 flex-row items-center justify-center"
            onPress={(e) => {
              e.stopPropagation();
              const pricePerUnit = item.visitType === "overnight" ? item.sitter?.pricePerNight : item.sitter?.pricePerDay;
              const start = new Date(item.startDate);
              const end = new Date(item.endDate);
              const diffTime = Math.abs(end.getTime() - start.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              router.push({
                pathname: "/bookings/payment",
                params: {
                  bookingId: item.id.toString(),
                  sitterName: otherParty,
                  amount: item.totalPrice,
                  sitterRate: pricePerUnit?.toString(),
                  numberOfDays: diffDays.toString(),
                  visitType: item.visitType,
                },
              } as any);
            }}
            activeOpacity={0.8}
          >
            <IconSymbol name="creditcard.fill" size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Pay Now — ${item.totalPrice}
            </Text>
          </TouchableOpacity>
        )}

        {/* Payment Confirmed Badge */}
        {isOwner && item.status === "confirmed" && item.paymentIntentId && (
          <View className="bg-success/10 rounded-xl p-3 mb-3 flex-row items-center">
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
            <Text className="text-sm font-semibold text-success ml-2">
              Payment Confirmed
            </Text>
          </View>
        )}

        {/* Review Prompt for Completed Bookings */}
        {canReview && (
          <TouchableOpacity
            className="bg-warning/10 rounded-xl p-3 mb-3 flex-row items-center"
            onPress={(e) => {
              e.stopPropagation();
              router.push({
                pathname: "/bookings/review",
                params: { bookingId: item.id.toString(), sitterName: otherParty },
              } as any);
            }}
            activeOpacity={0.8}
          >
            <IconSymbol name="star.fill" size={20} color={colors.warning} />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-bold text-foreground">
                Leave a Review
              </Text>
              <Text className="text-xs text-muted">
                Share your experience with {otherParty}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </TouchableOpacity>
        )}

        {/* Already Reviewed Badge */}
        {isCompleted && item.hasReview && isOwner && (
          <View className="bg-success/10 rounded-xl p-3 mb-3 flex-row items-center">
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
            <Text className="text-sm font-semibold text-success ml-2">
              Review Submitted
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between pt-3 border-t border-border">
          <Text className="text-base font-bold text-primary">${item.totalPrice}</Text>
          <TouchableOpacity
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/messages/${item.conversationId}` as any);
            }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-sm">Message</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">Sign In Required</Text>
          <Text className="text-base text-muted text-center mb-6">
            Please sign in to view your bookings
          </Text>
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

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-foreground mb-4">My Bookings</Text>

          {/* Tabs */}
          <View className="flex-row bg-surface rounded-xl p-1">
            {(["upcoming", "pending", "past"] as BookingTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                className={`flex-1 py-2 rounded-lg ${
                  activeTab === tab ? "bg-primary" : ""
                }`}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center font-semibold capitalize ${
                    activeTab === tab ? "text-white" : "text-muted"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bookings List */}
        <View className="flex-1 px-6">
          {isLoading ? (
            <View className="flex-1">
              <PawLoadingAnimation message="Fetching your bookings..." />
              <BookingListSkeleton count={3} />
            </View>
          ) : bookings && bookings.length > 0 ? (
            <FlatList
              key={columns}
              numColumns={columns}
              columnWrapperStyle={columns === 2 ? { gap: 12 } : undefined}
              data={bookings}
              renderItem={({ item }) => (
                <View style={columns === 2 ? { flex: 1 } : undefined}>
                  {renderBooking({ item })}
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <NoBookings onBrowse={user.role === "owner" ? () => router.push("/(tabs)/search" as any) : undefined} />
          )}
          
          {/* Payment Methods Info */}
          {bookings && bookings.length > 0 && (
            <View className="mt-6 mb-4">
              <PaymentMethods 
                title="Accepted Payment Methods"
                subtitle="We accept all major credit cards and payment providers"
              />
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
