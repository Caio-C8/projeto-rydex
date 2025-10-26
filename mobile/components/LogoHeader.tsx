import React from "react";
import { View, Text, Image } from "react-native";

interface LogoHeaderProps {
  mainHeading: string;
  subHeading: string;
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({
  mainHeading,
  subHeading,
}) => {
  return (
    <View className="logo-container items-center">
      {/* Para usar imagens locais, coloque-a em 'assets' 
        e importe com 'require'
        ex: <Image source={require('../../assets/images/logo.png')} />
      */}
      <Image
        source={{
          uri: "https://placehold.co/120x80/000000/FFFFFF?text=RYDEX%0AMotoboy",
        }}
        alt="Logo RYDex"
        className="h-20 w-32" // Ajuste a largura/altura conforme necessário
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold mt-4 text-rydex-orange">
        {mainHeading}
      </Text>
      <Text className="text-base text-rydex-blue mt-1 font-medium">
        {subHeading}
      </Text>
    </View>
  );
};
