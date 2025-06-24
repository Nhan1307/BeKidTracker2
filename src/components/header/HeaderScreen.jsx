import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Appbar } from "react-native-paper";

const HeaderScreen = ({ title, showAddIcon = false, onPress }) => {
  const navigation = useNavigation();
  return (
    <Appbar.Header style={{ backgroundColor: "#2ecc71" }}>
      <View style={{ width: "15%", height: "100%", justifyContent: "center" }}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
      </View>
      <View
        style={{
          width: "70%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <Appbar.Content title={title} color="white" /> */}
        <Text style={{ fontWeight: "bold", fontSize: 23, color: "white" }}>
          {title}
        </Text>
      </View>
      <View
        style={{
          width: "15%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={onPress}>
          {showAddIcon && (
            <Ionicons name="add-outline" size={35} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </Appbar.Header>
  );
};

export default HeaderScreen;
