import React from "react";
// Importa componentes do react-native-svg
import { Svg, Path, Circle } from "react-native-svg";

export const EyeIcon: React.FC = () => (
  <Svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <Circle cx="12" cy="12" r="3" />
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
