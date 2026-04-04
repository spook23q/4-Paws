import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface BookingCostBreakdownProps {
  sitterRate: number; // per day or per night
  numberOfDays: number;
  visitType: "daily" | "overnight";
  serviceFeePercentage?: number; // Will be determined
}

export function BookingCostBreakdown({
  sitterRate,
  numberOfDays,
  visitType,
  serviceFeePercentage = 0, // To be determined
}: BookingCostBreakdownProps) {
  const colors = useColors();

  const subtotal = sitterRate * numberOfDays;
  const serviceFee = Math.round((subtotal * serviceFeePercentage) / 100 * 100) / 100;
  const bookingFee = 3; // $3 per booking
  const total = subtotal + serviceFee + bookingFee;

  const rateLabel = visitType === "daily" ? "per day" : "per night";

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 16 }}>
        Cost Breakdown
      </Text>

      {/* Sitter Rate */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View>
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 2 }}>
            Sitter Rate
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted }}>
            ${sitterRate.toFixed(2)} {rateLabel} × {numberOfDays} {numberOfDays === 1 ? "day" : "days"}
          </Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
          ${subtotal.toFixed(2)}
        </Text>
      </View>

      {/* Booking Fee */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View>
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 2 }}>
            Booking Fee
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted }}>
            4 Paws platform fee
          </Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
          ${bookingFee.toFixed(2)}
        </Text>
      </View>

      {/* Total */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
          Total Amount
        </Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.primary }}>
            ${total.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            AUD
          </Text>
        </View>
      </View>

      {/* Info Note */}
      <View style={{ backgroundColor: `${colors.primary}10`, borderRadius: 12, padding: 12, marginTop: 16, flexDirection: "row" }}>
        <Text style={{ fontSize: 12, color: colors.muted, flex: 1, lineHeight: 18 }}>
          The service fee covers insurance, payment processing, customer support, and platform maintenance.
        </Text>
      </View>
    </View>
  );
}
