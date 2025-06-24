import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import Logo from "../assets/logo.png";

const SplashScreen = () => {
  return (
    <>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Image
          source={Logo}
          style={{
            width: 150,
            height: 150,
            resizeMode: "contain",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
        <ActivityIndicator color={"black"} style={{ marginTop: 20 }} />
      </View>
    </>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
