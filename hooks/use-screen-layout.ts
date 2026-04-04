import { useWindowDimensions } from "react-native";

/**
 * Hook that provides responsive layout information based on screen dimensions.
 * Useful for adapting layouts between portrait and landscape orientations,
 * and for phone vs tablet distinctions.
 */
export function useScreenLayout() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 600;
  const isWide = width >= 768; // iPad or landscape phone with decent width

  return {
    width,
    height,
    isLandscape,
    isTablet,
    isWide,
    // In landscape, reduce vertical elements and use side-by-side layouts
    contentMaxWidth: isWide ? 720 : undefined,
    // Smaller cat/hero images in landscape to save vertical space
    heroImageSize: isLandscape ? Math.min(140, height * 0.25) : 220,
    // Columns for grid layouts (e.g., quick actions, cards)
    columns: isWide ? 2 : 1,
  };
}
