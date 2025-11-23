import { Dimensions, Platform, PixelRatio } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const horizontalScale = (size: number) =>
  (screenWidth / guidelineBaseWidth) * size;
export const verticalScale = (size: number) =>
  (screenHeight / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

export const COLORS = {
  background: "#f4f5f7",
  white: "#fff",
  textPrimary: "#2d3436",
  textSecondary: "#636e72",
  textMuted: "#b2bec3",
  primary: "#ff8c00",
  border: "#dfe6e9",
  shadow: "#a0a0a0",
  success: "#2ecc71",
  danger: "#e74c3c",
  online: "#2ecc71",
  offline: "#e74c3c",
  mapBlue: "#3498db",
};

export const SPACING = {
  xsmall: moderateScale(4),
  small: moderateScale(8),
  medium: moderateScale(16),
  large: moderateScale(24),
  xlarge: moderateScale(32),
};

export const FONT_SIZES = {
  xsmall: moderateScale(10),
  small: moderateScale(12),
  medium: moderateScale(14),
  large: moderateScale(18),
  xlarge: moderateScale(32),
};

export const BORDERS = {
  radiusSmall: moderateScale(10),
  radiusMedium: moderateScale(20),
  radiusPill: 50,
};
