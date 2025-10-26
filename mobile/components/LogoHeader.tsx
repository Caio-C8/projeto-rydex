import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface LogoHeaderProps {
  mainHeading: string;
  subHeading: string;
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({
  mainHeading,
  subHeading,
}) => {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require("../assets/images/logo-rydex.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.mainHeading}>{mainHeading}</Text>
      <Text style={styles.subHeading}>{subHeading}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: 30, // mb-8
    alignItems: "center",
  },
  logo: {
    height: 120, // h-20
    width: 200, // w-32
  },
  mainHeading: {
    fontSize: 24, // text-2xl
    fontWeight: "bold",
    marginTop: 16, // mt-4
    color: "#FF5722", // text-rydex-orange
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 16, // text-base
    color: "#004D61", // text-rydex-blue
    marginTop: 4, // mt-1
    fontWeight: "500", // font-medium
    textAlign: 'center',
  },
});
