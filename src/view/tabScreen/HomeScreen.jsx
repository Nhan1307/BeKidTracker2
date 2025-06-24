import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext } from "react";
import { Appbar, PaperProvider } from "react-native-paper";
import themeContext from "../../context/themeContext";
import Subject from "./components/Subject";
// import Bubble from "../Bubble/Bubble";

const HomeScreen = () => {
  const theme = useContext(themeContext);

  return (
    <PaperProvider style={{ flex: 1 }}>
      <Appbar.Header
        elevated="true"
        style={{ backgroundColor: theme.background }}
      >
        <View
          style={{
            width: "85%",
            height: "100%",
            justifyContent: "center",
            paddingLeft: 15,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 30, color: "#3B7DED" }}>
            CSM
          </Text>
        </View>

        <TouchableOpacity>
          <Appbar.Action icon="bell" size={30} color={theme.color} />
        </TouchableOpacity>
      </Appbar.Header>

      <View style={{ flex: 1 }}>
        {/* Subject */}
        <Subject />

        {/* bubble */}
        {/* <Bubble /> */}
      </View>
    </PaperProvider>
  );
};

export default HomeScreen;
