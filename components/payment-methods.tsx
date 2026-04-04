import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface PaymentMethodsProps {
  title?: string;
  subtitle?: string;
}

export function PaymentMethods({ title, subtitle }: PaymentMethodsProps) {
  return (
    <View className="bg-surface rounded-2xl p-5 border border-border">
      {title && (
        <Text className="text-lg font-bold text-foreground mb-2 text-center">{title}</Text>
      )}
      {subtitle && (
        <Text className="text-sm text-muted mb-4 text-center leading-relaxed">{subtitle}</Text>
      )}
      <View className="flex-row justify-center items-center gap-4 flex-wrap">
        {/* Visa */}
        <View className="bg-white rounded-lg p-3 border border-border items-center justify-center" style={{ width: 70, height: 45 }}>
          <FontAwesome name="cc-visa" size={32} color="#1A1F71" />
        </View>
        
        {/* Mastercard */}
        <View className="bg-white rounded-lg p-3 border border-border items-center justify-center" style={{ width: 70, height: 45 }}>
          <FontAwesome name="cc-mastercard" size={32} color="#EB001B" />
        </View>
        
        {/* PayPal */}
        <View className="bg-white rounded-lg p-3 border border-border items-center justify-center" style={{ width: 70, height: 45 }}>
          <FontAwesome name="cc-paypal" size={32} color="#003087" />
        </View>
        
        {/* Stripe */}
        <View className="bg-white rounded-lg p-3 border border-border items-center justify-center" style={{ width: 70, height: 45 }}>
          <FontAwesome name="cc-stripe" size={32} color="#635BFF" />
        </View>
      </View>
      <Text className="text-xs text-muted text-center mt-3">
        All payments are secure and encrypted
      </Text>
    </View>
  );
}
