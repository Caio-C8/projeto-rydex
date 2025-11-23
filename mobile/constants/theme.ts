// Em: mobile/constants/theme.ts
import { Dimensions, Platform } from 'react-native';

// --- Funções de Escala (Copiadas do seu _layout.tsx da main) ---
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const horizontalScale = (size: number) => (screenWidth / guidelineBaseWidth) * size;
export const verticalScale = (size: number) => (screenHeight / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (horizontalScale(size) - size) * factor;
// --- Fim da Escala ---

// --- Definição das Cores ---
const tintColorLight = '#FF5722';
const tintColorDark = '#fff';

// Cores específicas do Rydex
const rydexOrange = "#FF5722";
const rydexBlue = "#FF5722";
const rydexGray = "#2C2C2C";
const appBackground = "#F0F0F0"; // O fundo cinza claro que usamos

export const Colors = {
  light: {
    // Cores originais do seu tema
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    
    // --- Nossas cores adicionadas ---
    rydexOrange: rydexOrange,
    rydexBlue: rydexBlue,
    rydexGray: rydexGray,
    appBackground: appBackground,
    lightGray: "#D1D5DB",
    textGray: "#6B7280",
  },
  dark: {
    // Cores originais do seu tema
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    // --- Nossas cores adicionadas (podemos ajustar para dark mode depois) ---
    rydexOrange: rydexOrange,
    rydexBlue: rydexBlue,
    rydexGray: rydexGray, // Talvez aqui devesse ser '#ECEDEE'
    appBackground: '#151718', // Fundo do app no dark mode
    lightGray: "#4B5563", // Um cinza mais escuro
    textGray: "#9CA3AF",
  },
};
// --- Fim das Cores ---

// --- Font Families (O seu código original) ---
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
// --- Fim das Font Families ---

// --- Font Sizes (O que faltava) ---
export const FontSizes = {
  titleLarge: moderateScale(28),
  title: moderateScale(24),
  subtitle: moderateScale(18),
  body: moderateScale(16),
  caption: moderateScale(14),
  small: moderateScale(12),
};
// --- Fim dos Font Sizes ---