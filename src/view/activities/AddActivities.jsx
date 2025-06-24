import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Alert,
  FlatList,
  TextInput,
  Image,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import HeaderScreen from "../../components/header/HeaderScreen";
import { PaperProvider } from "react-native-paper";
import themeContext from "../../context/themeContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import { getToken } from "../../ultis/authHelper";
import { appInfo } from "../../constants/appInfos";
import { useDispatch } from "react-redux";

const AddActivities = ({ navigation }) => {
  const theme = useContext(themeContext);
  const dispatch = useDispatch();
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isExam, setIsExam] = useState(false);
  const [isWeekly, setIsWeekly] = useState(false);
  const [openChild, setOpenChild] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [activity, setActivity] = useState("");
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState([
    { id: 1, label: "5 phút", value: "5 phút" },
    { id: 2, label: "10 phút", value: "10 phút" },
    { id: 3, label: "15 phút", value: "15 phút" },
    { id: 4, label: "20 phút", value: "20 phút" },
    { id: 5, label: "30 phút", value: "30 phút" },
  ]);
  const [selectedTimer, setSelectedTimer] = useState(null);

  const activities = [
    { id: 1, label: "Học tập", icon: "📘" },
    { id: 2, label: "Vệ sinh cá nhân", icon: "🧼" },
    { id: 3, label: "Chạy bộ", icon: "🏃" },
    { id: 4, label: "Vui chơi", icon: "🎮" },
    { id: 5, label: "Ăn uống", icon: "🍽️" },
    { id: 6, label: "Đọc sách", icon: "📚" },
    { id: 7, label: "Ngủ", icon: "💤" },
    { id: 8, label: "Thể dục", icon: "🏋️" },
    { id: 9, label: "Ngoài trời", icon: "🌳" },
    { id: 10, label: "Nhạc", icon: "🎵" },
  ];

  useEffect(() => {
    if (openChild) setOpenTime(false);
  }, [openChild]);

  useEffect(() => {
    if (openTime) setOpenChild(false);
  }, [openTime]);

  useEffect(() => {
    const fetchAllChild = async () => {
      setLoading(true);
      try {
        const token = await getToken(dispatch);
        if (!token) return;

        const res = await fetch(`${appInfo.BASE_URL}/api/children`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const children = data.data || [];

        setItems(
          children.map((child) => ({
            label: child.name,
            value: child._id,
          }))
        );

        if (children.length > 0) {
          setValue(children[0]._id);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách trẻ:", error.message);
        Alert.alert("Lỗi", "Không thể tải danh sách trẻ");
      } finally {
        setLoading(false);
      }
    };

    fetchAllChild();
  }, [dispatch]);

  const formatTimeString = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // const handleCreate = async () => {
  //   if (!value || !activity || !selectedTimer) {
  //     Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const token = await getToken(dispatch);
  //     if (!token) throw new Error("Không lấy được token");

  //     const endTime = new Date(startTime);
  //     const durationMinutes = parseInt(selectedTimer.split(" ")[0], 10);
  //     endTime.setMinutes(endTime.getMinutes() + durationMinutes);

  //     const scheduleData = {
  //       title: activity,
  //       startTime: formatTimeString(startTime),
  //       endTime: formatTimeString(endTime),
  //       repeat: isExam ? "weekly" : "daily",
  //       note: `${activity} - ${selectedTimer}`,
  //     };

  //     const response = await fetch(
  //       `${appInfo.BASE_URL}/api/thoigianbieu/${value}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(scheduleData),
  //       }
  //     );

  //     const result = await response.json();
  //     if (!response.ok) throw new Error(result.message);

  //     Alert.alert("Thành công", "Đã thêm hoạt động vào thời khóa biểu!");
  //     navigation.goBack();
  //   } catch (error) {
  //     Alert.alert("Lỗi", error.message || "Không thể tạo thời gian biểu");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleCreate = async () => {
    if (!value || !activity || !selectedTimer) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken(dispatch);
      if (!token) throw new Error("Không lấy được token");

      // Calculate the endTime based on the selectedTimer duration
      const endTime = new Date(startTime);
      const durationMinutes = parseInt(selectedTimer.split(" ")[0], 10);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);

      // Format the dateFrom as "dd/MM/yyyy"
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const formattedDateFrom = `${day}/${month}/${year}`;

      const scheduleData = {
        title: activity,
        startTime: formatTimeString(startTime),
        endTime: formatTimeString(endTime),
        repeat: isExam ? "weekly" : "daily",
        note: `${activity} - ${selectedTimer}`,
        dateFrom: formattedDateFrom, // New field added here
      };

      const response = await fetch(
        `${appInfo.BASE_URL}/api/thoigianbieu/${value}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(scheduleData),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      Alert.alert("Thành công", "Đã thêm hoạt động vào thời khóa biểu!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể tạo thời gian biểu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <HeaderScreen
        title="Tạo thời gian biểu mới"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={[{}]} // Truyền 1 mảng dummy để FlatList có thể render
        renderItem={() => (
          <View style={styles.container}>
            {/* Dropdown chọn trẻ */}
            <View style={{ zIndex: 3000 }}>
              <Text style={{ fontSize: 16 }}>Thời khóa biểu của:</Text>
              <DropDownPicker
                open={openChild}
                value={value}
                items={items}
                loading={loading}
                setOpen={setOpenChild}
                setValue={setValue}
                setItems={setItems}
                style={styles.dropdown}
                containerStyle={{ width: "100%" }}
                dropDownContainerStyle={{ borderColor: "#ccc" }}
                placeholder="Chọn trẻ"
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            <Text style={styles.textActivities}>
              Chọn thời gian cho hoạt động:
            </Text>
            <TouchableOpacity
              onPress={() => setShowPicker(!showPicker)}
              style={styles.datePicker}
            >
              <Text>
                Ngày {date.getDate()}, Tháng {date.getMonth() + 1},{" "}
                {date.getFullYear()}
              </Text>
              <Ionicons name="chevron-down" size={20} />
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(e, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

            <Text style={styles.textActivities}>Chọn loại hoạt động:</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {activities.map((item) => (
                <TouchableOpacity
                  key={item.id.toString()}
                  style={[
                    styles.activityItem,
                    activity === item.label && {
                      borderColor: "#33CC66",
                      backgroundColor: "#e8f9ef",
                    },
                  ]}
                  onPress={() => setActivity(item.label)}
                >
                  <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                  <Text style={{ fontSize: 15, textAlign: "center" }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <View
                style={[styles.labelBox, !isExam ? styles.activeBoxBlue : null]}
              >
                <Text style={{ color: !isExam ? "#fff" : "#000" }}>
                  Hàng ngày
                </Text>
              </View>
              <Switch
                value={isExam}
                onValueChange={() => setIsExam(!isExam)}
                thumbColor={"#fff"}
                trackColor={{ false: "#33CC66", true: "#f55" }}
              />
              <View
                style={[styles.labelBox, isExam ? styles.activeBoxRed : null]}
              >
                <Text style={{ color: isExam ? "#fff" : "#000" }}>
                  Hàng tuần
                </Text>
              </View>
            </View>

            {/* Time duration dropdown */}
            <View style={{ zIndex: 2000 }}>
              <Text style={{ fontSize: 16 }}>Thời lượng:</Text>
              <DropDownPicker
                open={openTime}
                value={selectedTimer}
                items={timer}
                setOpen={setOpenTime}
                setValue={setSelectedTimer}
                setItems={setTimer}
                placeholder="Chọn thời lượng"
                style={styles.dropdown}
                containerStyle={{ width: "100%" }}
                dropDownContainerStyle={{ borderColor: "#ccc" }}
                zIndex={2000}
                zIndexInverse={1000}
              />
            </View>

            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <Text style={styles.textActivities}>Thời gian bắt đầu:</Text>
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={(e, selectedTime) => {
                  if (selectedTime) setStartTime(selectedTime);
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleCreate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "ĐANG TẠO..." : "TẠO"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </PaperProvider>
  );
};

export default AddActivities;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  textActivities: { fontSize: 16, paddingVertical: 12 },
  dropdown: { marginBottom: 15, borderColor: "#ccc" },
  datePicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    marginTop: 10,
  },
  activityItem: {
    width: 82,
    height: 82,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 4,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  labelBox: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginHorizontal: 10,
  },
  activeBoxBlue: {
    backgroundColor: "#33CC66",
    borderColor: "#33CC66",
  },
  activeBoxRed: {
    backgroundColor: "#f55",
    borderColor: "#f55",
  },
  button: {
    backgroundColor: "#33CC66",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
