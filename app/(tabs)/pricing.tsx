import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useScreenLayout } from "@/hooks/use-screen-layout";

interface PricingFeature {
  feature: string;
  fourPaws: string | boolean;
  pawshake: string | boolean;
  madPaws: string | boolean;
}

const PRICING_COMPARISON: PricingFeature[] = [
  {
    feature: "Booking Fee",
    fourPaws: "$3 per booking",
    pawshake: "10-15% commission",
    madPaws: "15-20% commission",
  },
  {
    feature: "Registration Fee",
    fourPaws: true,
    pawshake: false,
    madPaws: false,
  },
  {
    feature: "Monthly Subscription",
    fourPaws: true,
    pawshake: false,
    madPaws: false,
  },
  {
    feature: "Service Fee",
    fourPaws: "Included in total",
    pawshake: "Additional 5-10%",
    madPaws: "Additional 5-10%",
  },
  {
    feature: "Payment Method",
    fourPaws: "Stripe (all major cards)",
    pawshake: "Stripe + PayPal",
    madPaws: "Stripe + PayPal",
  },
  {
    feature: "Sitter Registration",
    fourPaws: "Free",
    pawshake: "Free",
    madPaws: "Free",
  },
  {
    feature: "Real-Time Chat",
    fourPaws: true,
    pawshake: true,
    madPaws: true,
  },
  {
    feature: "Photo Updates",
    fourPaws: true,
    pawshake: true,
    madPaws: true,
  },
  {
    feature: "Booking Insurance",
    fourPaws: true,
    pawshake: true,
    madPaws: true,
  },
  {
    feature: "Geo-Fencing",
    fourPaws: true,
    pawshake: false,
    madPaws: false,
  },
  {
    feature: "Compliance Verification",
    fourPaws: true,
    pawshake: true,
    madPaws: true,
  },
  {
    feature: "24/7 Support",
    fourPaws: true,
    pawshake: true,
    madPaws: true,
  },
];

function FeatureCell({
  value,
  isHeader = false,
  isFourPaws = false,
}: {
  value: string | boolean;
  isHeader?: boolean;
  isFourPaws?: boolean;
}) {
  const colors = useColors();

  if (typeof value === "boolean") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 48,
          backgroundColor: isHeader ? `${colors.primary}15` : "transparent",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {value ? (
          <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
        ) : (
          <IconSymbol name="xmark.circle.fill" size={24} color={colors.muted} />
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
        paddingHorizontal: 8,
        backgroundColor: isHeader ? (isFourPaws ? `${colors.success}15` : `${colors.primary}15`) : "transparent",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: isHeader ? 13 : 12,
          fontWeight: isHeader ? "700" : "500",
          color: isHeader ? (isFourPaws ? colors.success : colors.primary) : colors.foreground,
          textAlign: "center",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function PricingComparisonScreen() {
  const colors = useColors();
  const { isLandscape } = useScreenLayout();

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.foreground, marginBottom: 8 }}>
            Why Choose 4 Paws?
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
            Compare our transparent pricing with other cat sitting platforms. We believe in keeping it simple — just $3 per booking, no hidden fees.
          </Text>
        </View>

        {/* Pricing Highlight */}
        <View
          style={{
            backgroundColor: `${colors.success}15`,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            borderWidth: 2,
            borderColor: colors.success,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <IconSymbol name="star.fill" size={20} color={colors.success} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.success, marginLeft: 8 }}>
              Best Value
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.foreground, lineHeight: 20 }}>
            4 Paws charges just <Text style={{ fontWeight: "700" }}>$3 per booking</Text> with no registration fees, no monthly subscriptions, and no hidden costs. That's up to <Text style={{ fontWeight: "700" }}>80% cheaper</Text> than competitors!
          </Text>
        </View>

        {/* Comparison Table */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 24,
          }}
        >
          {/* Header Row */}
          <View style={{ flexDirection: "row", backgroundColor: colors.background }}>
            <View
              style={{
                flex: 1.2,
                paddingHorizontal: 12,
                paddingVertical: 12,
                justifyContent: "center",
                borderRightWidth: 1,
                borderRightColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }}>
                Feature
              </Text>
            </View>
            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border }}>
              <FeatureCell value="4 Paws" isHeader isFourPaws />
            </View>
            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border }}>
              <FeatureCell value="Pawshake" isHeader />
            </View>
            <View style={{ flex: 1 }}>
              <FeatureCell value="Mad Paws" isHeader />
            </View>
          </View>

          {/* Data Rows */}
          {PRICING_COMPARISON.map((row, idx) => (
            <View key={idx} style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border }}>
              <View
                style={{
                  flex: 1.2,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  justifyContent: "center",
                  borderRightWidth: 1,
                  borderRightColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                  {row.feature}
                </Text>
              </View>
              <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border }}>
                <FeatureCell value={row.fourPaws} isFourPaws />
              </View>
              <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border }}>
                <FeatureCell value={row.pawshake} />
              </View>
              <View style={{ flex: 1 }}>
                <FeatureCell value={row.madPaws} />
              </View>
            </View>
          ))}
        </View>

        {/* Key Benefits */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
            Why 4 Paws Stands Out
          </Text>
          <View style={{ gap: 12 }}>
            {[
              {
                icon: "dollarsign.circle.fill",
                title: "Transparent Pricing",
                desc: "$3 per booking. No surprises, no hidden fees.",
              },
              {
                icon: "shield.fill",
                title: "Geo-Fencing Technology",
                desc: "Know exactly where your sitter is with real-time location tracking.",
              },
              {
                icon: "checkmark.seal.fill",
                title: "Verified Sitters",
                desc: "All sitters undergo compliance verification and background checks.",
              },
              {
                icon: "message.fill",
                title: "Real-Time Communication",
                desc: "Chat, photo updates, and instant notifications keep you connected.",
              },
            ].map((benefit, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  backgroundColor: `${colors.primary}08`,
                  borderRadius: 12,
                  padding: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                }}
              >
                <IconSymbol name={benefit.icon as any} size={20} color={colors.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }}>
                    {benefit.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 18 }}>
                    {benefit.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.success,
            borderRadius: 12,
            paddingVertical: 14,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
            Get Started with 4 Paws Today
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
