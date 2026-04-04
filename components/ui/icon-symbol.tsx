// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "line.3.horizontal": "menu",
  "heart.fill": "favorite",
  "shield.fill": "shield",
  "star.fill": "star",
  "clock.fill": "access-time",
  "person.2.fill": "people",
  "message.fill": "message",
  "phone.fill": "phone",
  "checkmark.seal.fill": "verified",
  "lock.fill": "lock",
  "eye.slash.fill": "visibility-off",
  "checkmark.shield.fill": "verified-user",
  "key.fill": "vpn-key",
  "questionmark.circle.fill": "help",
  "magnifyingglass": "search",
  "slider.horizontal.3": "tune",
  "person.fill": "person",
  "calendar": "event",
  "chevron.left": "chevron-left",
  "bubble.left.and.bubble.right.fill": "chat",
  "map": "map",
  "map.fill": "map",
  "list.bullet": "list",
  "creditcard.fill": "credit-card",
  "sun.max.fill": "wb-sunny",
  "moon.fill": "dark-mode",
  "gear": "settings",
  "checkmark.circle.fill": "check-circle",
  "pawprint.fill": "pets",
  "location.fill": "location-on",
  "camera.fill": "photo-camera",
  "photo.fill": "photo",
  "xmark": "close",
  "trash.fill": "delete",
  "bell.fill": "notifications",
  "bell.badge.fill": "notifications-active",
  "calendar.badge.clock": "event-available",
  "calendar.badge.exclamationmark": "event-busy",
  "circle.fill": "circle",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  "doc.text.fill": "description",
  "exclamationmark.triangle.fill": "warning",
  "clock.badge.exclamationmark": "schedule",
  "person.badge.shield.checkmark.fill": "admin-panel-settings",
  "doc.badge.gearshape.fill": "fact-check",
  "checkmark": "check",
  "checkmark.circle": "done",
  "text.badge.checkmark": "done-all",
  "speaker.fill": "volume-mute",
  "speaker.wave.2.fill": "volume-up",
  "play.fill": "play-arrow",
  "info.circle.fill": "info",
  "xmark.circle.fill": "cancel",
  "dollarsign.circle.fill": "attach-money",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
