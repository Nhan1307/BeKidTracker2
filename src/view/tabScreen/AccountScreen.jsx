import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Switch,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Appbar, PaperProvider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { removeAuth } from "../../redux/reducers/authReducer";
import { EventRegister } from "react-native-event-listeners";
import themeContext from "../../context/themeContext";

const AccountScreen = ({ navigation }) => {
  const [isEnabledClock, setIsEnabledClock] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [user, setUser] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = useContext(themeContext);
  const dispatch = useDispatch();
  const toggleSwitchClock = () => setIsEnabledClock((prev) => !prev);

  useEffect(() => {
    getEmailFromStorage();
  }, []);

  const getEmailFromStorage = async () => {
    try {
      const user = await AsyncStorage.getItem("auth");
      const parsedUser = JSON.parse(user); // Parse string to object

      setUser(parsedUser);

      if (parsedUser) {
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to retrieve email from AsyncStorage:", error);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      console.log("Đang đăng xuất...");
      await AsyncStorage.removeItem("auth");
      console.log("Đã xóa auth khỏi AsyncStorage.");
      dispatch(removeAuth());
      console.log("Đã cập nhật Redux store.");
    } catch (error) {
      console.log("Lỗi khi đăng xuất:", error);
    }
  };

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
            CMS
          </Text>
        </View>
        <TouchableOpacity>
          <Appbar.Action icon="bell" size={30} color={theme.color} />
        </TouchableOpacity>
      </Appbar.Header>

      <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
        {/* Info User */}
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <TouchableOpacity
            style={{
              width: "100%",
              height: 120,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={[
                styles.boxInfoUser,
                {
                  borderColor: theme.borderColor,
                  backgroundColor: theme.background,
                },
              ]}
            >
              <View
                style={{
                  flex: 2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={45}
                  color={theme.color}
                />
              </View>
              <View style={{ flex: 6.7, justifyContent: "center" }}>
                {/* <Text style={styles.name}>{user.fullname}</Text>
                <Text style={styles.email}>{user.email}</Text> */}
              </View>
              <View
                style={{
                  flex: 1.3,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="chevron-forward-outline"
                  size={25}
                  color={theme.color}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View
          style={{
            width: "100%",
            height: 310,
          }}
        >
          <View
            style={{
              flex: 1.5,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginLeft: 12,
                color: theme.color,
              }}
            >
              Cài đặt
            </Text>
          </View>

          <View
            style={{
              flex: 5,
              backgroundColor: theme.background,
              borderColor: theme.borderColor,
            }}
          >
            {/* che do ban dem */}
            <View
              style={{
                width: "100%",
                height: 55,
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flex: 1.5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../img/imgTab/nightMode.png")}
                  style={{ width: 45, height: 45, resizeMode: "contain" }}
                />
              </View>
              <View
                style={{
                  flex: 7,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    paddingLeft: 5,
                    color: theme.color,
                  }}
                >
                  Chế độ ban đêm
                </Text>
              </View>
              <View
                style={{
                  flex: 1.5,
                  justifyContent: "center",
                }}
              >
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  onValueChange={(value) => {
                    setIsDarkMode(value);
                    EventRegister.emit("ChangeTheme", value);
                  }}
                  value={isDarkMode}
                  style={{ width: 35, height: 25, marginLeft: 6 }}
                />
              </View>
            </View>

            {/* change password */}
            <TouchableOpacity
              style={{
                width: "100%",
                height: 55,
                flexDirection: "row",
              }}
              onPress={() =>
                navigation.navigate("ChangePassword", { user: user })
              }
            >
              <View
                style={{
                  flex: 1.5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../img/imgTab/changePassword.png")}
                  style={{ width: 42, height: 42, resizeMode: "contain" }}
                />
              </View>
              <View
                style={{
                  flex: 7,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    paddingLeft: 5,
                    color: theme.color,
                  }}
                >
                  Thay đổi mật khẩu
                </Text>
              </View>
              <View
                style={{
                  flex: 1.5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="chevron-forward-outline"
                  size={25}
                  color={theme.color}
                />
              </View>
            </TouchableOpacity>

            {/* Unlock Performance Chart */}
            <TouchableOpacity
              style={{
                width: "100%",
                height: 55,
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
              }}
              onPress={() => navigation.navigate("UnlockPerformanceChart")}
            >
              <View style={{ flex: 1.5, justifyContent: "center", alignItems: "center" }}>
                <Image
                  source={require("../../img/imgTab/icons8-chart-94.png")}
                  style={{ width: 42, height: 42, resizeMode: "contain" }}
                />
              </View>
              <View style={{ flex: 7, justifyContent: "center" }}>
                <Text style={{ fontSize: 17, fontWeight: 500, paddingLeft: 5 }}>
                  Biểu đồ hiệu suất chi tiết
                </Text>
              </View>
              <View style={{ flex: 1.5, justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="chevron-forward-outline" size={25} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* log out */}
        <View
          style={{
            width: "100%",
            height: 75,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            style={[
              styles.boxLogout,
              {
                borderColor: theme.borderColor,
                backgroundColor: theme.background,
              },
            ]}
            onPress={handleLogout}
          >
            <Text
              style={[
                { fontSize: 20, fontWeight: "bold" },
                { color: theme.color },
              ]}
            >
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  boxInfoUser: {
    width: "80%",
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "white",
    flexDirection: "row",
  },
  boxLogout: {
    width: "70%",
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 18, color: "#2A7BD3", fontWeight: "bold" },
  email: { marginTop: 5, fontSize: 16, color: "#C5C5C5" },
  settingItem: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderColor: "#D0D0D0",
  },
  collectionItem: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderColor: "#D0D0D0",
  },
  icon: { width: 30, height: 30, marginRight: 10 },
  settingText: { fontSize: 16 },
  collectionText: { fontSize: 16 },
  timeText: { fontSize: 16, color: "#2A7BD3" },
  switch: { marginRight: 10 },
});

export default AccountScreen;
