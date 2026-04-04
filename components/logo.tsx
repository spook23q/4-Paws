import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface LogoProps {
  width?: number;
  height?: number;
}

// Light mode: black text with blue paw on transparent background
const LOGO_LIGHT_URL =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/HfvkYmarEgZyTmff.png";

// Dark mode: original cream text with blue paw
const LOGO_DARK_URL =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/bpRkIMTQTfYlkaNp.png";

/**
 * 4 Paws Logo component
 * Uses the original PNG logo images with the correct font style.
 * Light mode: black text with blue paw print.
 * Dark mode: cream text with blue paw print (original).
 */
export function Logo({ width = 320, height = 110 }: LogoProps) {
  const colorScheme = useColorScheme();
  const logoUrl = colorScheme === "dark" ? LOGO_DARK_URL : LOGO_LIGHT_URL;

  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={{ uri: logoUrl }}
        style={{ width, height }}
        contentFit="contain"
        transition={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
