import React from "react";
import { Svg, Path, Circle, Line } from "react-native-svg";

export const EyeIcon: React.FC = () => (
  <Svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2C2C2C" // Cor rydex-gray
    strokeWidth="2"
  >
    <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOffIcon: React.FC = () => (
  <Svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2C2C2C" // Cor rydex-gray
    strokeWidth="2"
  >
    <Path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <Path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <Path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <Line x1="2" x2="22" y1="2" y2="22" />
  </Svg>
);

export const CloudUploadIcon: React.FC = () => (
  <Svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2C2C2C"
    strokeWidth="2"
  >
    <Path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.5" />
    <Path d="M12 21v-8" />
    <Path d="m19 16-7-7-7 7" />
  </Svg>
);

export const DoubleCheckIcon: React.FC = () => (
  <Svg
    width="80" 
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FF5722" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M18 6 7 17l-5-5" />
    <Path d="m22 6-11 11-4-4" />
  </Svg>
);

export const ErrorIcon: React.FC = () => (
  <Svg
    width="80" // Tamanho grande, como no Figma
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FF5722" // Laranja Rydex (igual ao de sucesso, pode mudar se quiser)
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx="12" cy="12" r="10" />
    <Line x1="15" y1="9" x2="9" y2="15" />
    <Line x1="9" y1="9" x2="15" y2="15" />
  </Svg>
);
