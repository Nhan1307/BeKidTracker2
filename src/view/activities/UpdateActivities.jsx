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
  ActivityIndicator,
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

const UpdateActivities = ({ navigation, route }) => {
  const theme = useContext(themeContext);
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  // Lấy item từ navigation params
  const { item } = route.params || {};

  console.log("item update activities:", item);

  // Phân tích chuỗi thời gian từ item.start (ví dụ: "08:00")
  const parseTimeFromString = (timeString) => {
    if (!timeString) return new Date();

    const [hours, minutes] = timeString.split(":").map(Number);
    const time = new Date();
    time.setHours(hours);
    time.setMinutes(minutes);
    return time;
  };

  // Trích xuất thời lượng từ item.duration (ví dụ: "30 phút")
  const extractDuration = (durationStr) => {
    if (!durationStr) return "30 phút";
    return durationStr;
  };

  // Parse date từ dateFrom nếu có
  const parseDateFromString = (dateFromStr) => {
    if (!dateFromStr) return new Date();

    try {
      // Nếu định dạng là dd/MM/yyyy
      const [day, month, year] = dateFromStr.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      return isNaN(date.getTime()) ? new Date() : date;
    } catch (error) {
      // Nếu là định dạng ISO hoặc khác
      try {
        const date = new Date(dateFromStr);
        return isNaN(date.getTime()) ? new Date() : date;
      } catch (err) {
        return new Date();
      }
    }
  };

  const [date, setDate] = useState(
    item?.dateFrom ? parseDateFromString(item.dateFrom) : new Date()
  );
  const [selectedDate, setSelectedDate] = useState(false); // Flag to track if date was manually selected
  const [startTime, setStartTime] = useState(
    item?.start ? parseTimeFromString(item.start) : new Date()
  );
  const [showDate, setShowDate] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isExam, setIsExam] = useState(item?.repeat === "weekly");
  const [openTime, setOpenTime] = useState(false);
  const [activity, setActivity] = useState(item?.title || "");
  const [value, setValue] = useState(item.child);
  
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState([
    { id: 1, label: "5 phút", value: "5 phút" },
    { id: 2, label: "10 phút", value: "10 phút" },
    { id: 3, label: "15 phút", value: "15 phút" },
    { id: 4, label: "20 phút", value: "20 phút" },
    { id: 5, label: "30 phút", value: "30 phút" },
  ]);
  const [selectedTimer, setSelectedTimer] = useState(
    item?.duration ? extractDuration(item.duration) : null
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = await getToken(dispatch);
        const res = await fetch(`${appInfo.BASE_URL}/api/children`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const list = (json.data || []).map((c) => ({ label: c.name, value: c._id }));
        setItems(list);
      } catch {
        Alert.alert("Lỗi", "Không thể tải danh sách trẻ");
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  // derive childName from items and value
  const childName = items.find((c) => c.value === value)?.label || "";

  console.log("childName:", childName);
  
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
    if (openTime) setOpenTime(false);
  }, []);

  const formatTimeString = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDateString = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleUpdate = async () => {
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

      // Create a proper ISO format date - using UTC to avoid timezone issues
      // Set time to noon to avoid timezone crossing day boundaries
      const isoDate = new Date(date);
      isoDate.setHours(12, 0, 0, 0);
      
      console.log("Original date object:", date);
      console.log("ISO date to send:", isoDate.toISOString());

      const scheduleData = {
        title: activity,
        startTime: formatTimeString(startTime),
        endTime: formatTimeString(endTime),
        duration: selectedTimer,
        repeat: isExam ? "weekly" : "daily",
        note: `${activity} - ${selectedTimer}`,
        dateFrom: isoDate.toISOString(), // Send as ISO string
      };

      console.log("scheduleData being sent:", scheduleData);

      let response;
      if (item && item.id) {
        // Nếu có item.id thì là update
        response = await fetch(
          `${appInfo.BASE_URL}/api/thoigianbieu/${item.id}`,
          {
            method: "PUT", // Sử dụng PUT để cập nhật
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(scheduleData),
          }
        );
      } else {
        // Nếu không có item.id thì là tạo mới
        response = await fetch(
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
      }

      const result = await response.json();
      console.log("API response:", result);
      
      if (!response.ok) throw new Error(result.message || "Cập nhật không thành công");

      Alert.alert(
        "Thành công",
        item?.id
          ? "Đã cập nhật hoạt động!"
          : "Đã thêm hoạt động vào thời khóa biểu!"
      );
      
      // Navigate back on success
      navigation.goBack();
      
    } catch (error) {
      console.error("Error in handleUpdate:", error);
      Alert.alert("Lỗi", error.message || "Không thể cập nhật thời gian biểu");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !items.length) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#33CC66" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <HeaderScreen
        title={item?.id ? "Cập nhật thời gian biểu" : "Tạo thời gian biểu mới"}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={[{}]} // Truyền 1 mảng dummy để FlatList có thể render
        renderItem={() => (
          <View style={styles.container}>
            {/* Phần hiển thị tên của trẻ thay vì DropDownPicker */}
            <Text style={{ fontSize: 16 }}>
              Thời khóa biểu của:{" "}
              <Text style={styles.childNameText}>{childName}</Text>
            </Text>

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
                  if (selectedDate) {
                    setDate(selectedDate);
                    setSelectedDate(true); // Mark that date was manually selected
                    console.log("Date selected:", selectedDate);
                  }
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
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "ĐANG XỬ LÝ..." : item?.id ? "CẬP NHẬT" : "TẠO"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </PaperProvider>
  );
};

export default UpdateActivities;

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
  childInfoContainer: {
    marginBottom: 15,
  },
  childNameText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    color: "#33CC66",
  },
});