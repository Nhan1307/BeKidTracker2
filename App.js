import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { Provider } from "react-redux";
import store from "./src/redux/store";
import { NavigationContainer } from "@react-navigation/native";
import NavigationStack from "./src/navigation/NavigationStack";
import { useEffect, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { theme } from "./src/context/theme";
import themeContext from "./src/context/themeContext";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const listener = EventRegister.addEventListener("ChangeTheme", (data) => {
      setIsDarkMode(data);
    });
    return () => {
      EventRegister.removeEventListener(listener);
    };
  }, [isDarkMode]);
  return (
    <Provider store={store}>
      <StatusBar
        barStyle={"dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <themeContext.Provider value={isDarkMode ? theme.dark : theme.light}>
        <NavigationContainer>
          <NavigationStack />
        </NavigationContainer>
      </themeContext.Provider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
