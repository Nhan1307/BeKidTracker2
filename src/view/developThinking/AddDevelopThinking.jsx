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

const AddDevelopThinking = ({ navigation }) => {
  const theme = useContext(themeContext);
  const dispatch = useDispatch();

  // Ngày và giờ bắt đầu
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Chọn lặp: daily/weekly
  const [isWeekly, setIsWeekly] = useState(false);

  // Dropdown chọn trẻ
  const [openChild, setOpenChild] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);

  // Nhập loại hoạt động
  const [activity, setActivity] = useState("");

  // Nhập điểm
  const [score, setScore] = useState("");

  const [loading, setLoading] = useState(false);

  // Fetch danh sách trẻ
  useEffect(() => {
    const fetchAllChild = async () => {
      try {
        setLoading(true);
        const token = await getToken(dispatch);
        const res = await fetch(`${appInfo.BASE_URL}/api/children`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const { data } = await res.json();
        const children = data || [];
        setItems(
          children.map((child) => ({
            label: child.name,
            value: child._id,
          }))
        );
        if (children.length > 0) setValue(children[0]._id);
      } catch (err) {
        Alert.alert("Lỗi", "Không thể tải danh sách trẻ");
      } finally {
        setLoading(false);
      }
    };
    fetchAllChild();
  }, [dispatch]);

  // Format giờ thành "HH:mm"
  const formatTimeString = (date) => {
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const handleCreate = async () => {
    if (!value || !activity.trim() || score.trim() === "") {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }
    try {
      setLoading(true);
      const token = await getToken(dispatch);
      if (!token) throw new Error("Không lấy được token");

      // --- PHẦN TỰ ĐỘNG ĐẶT endTime = startTime + 24 giờ ---
      const endTime = new Date(startTime);
      endTime.setDate(endTime.getDate() + 1);

      // Format dateFrom
      const d = date.getDate().toString().padStart(2, "0");
      const m = (date.getMonth() + 1).toString().padStart(2, "0");
      const y = date.getFullYear();
      const formattedDateFrom = `${d}/${m}/${y}`;

      const scheduleData = {
        title: activity.trim(),
        startTime: formatTimeString(startTime),
        endTime: '23:59',
        repeat: isWeekly ? "weekly" : "daily",
        note: activity.trim(),
        dateFrom: formattedDateFrom,
        score: Number(score),
      };

      const res = await fetch(
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
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      Alert.alert("Thành công", "Đã thêm hoạt động!");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tạo thời gian biểu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <HeaderScreen
        title="Tạo hoạt động mới"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={[{}]}
        keyExtractor={(_, i) => i.toString()}
        renderItem={() => (
          <View style={styles.container}>
            {/* Chọn trẻ */}
            <View style={{ zIndex: 3000 }}>
              <Text style={{ fontSize: 16 }}>Hoạt động nâng cao của:</Text>
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

            {/* Chọn ngày */}
            <Text style={styles.textActivities}>Chọn ngày:</Text>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={styles.datePicker}
            >
              <Text>
                Ngày {date.getDate()}, Tháng {date.getMonth() + 1}, {date.getFullYear()}
              </Text>
              <Ionicons name="chevron-down" size={20} />
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(_, sd) => {
                  setShowPicker(false);
                  if (sd) setDate(sd);
                }}
              />
            )}

            {/* Nhập loại hoạt động */}
            <Text style={styles.textActivities}>Tên hoạt động:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên hoạt động"
              value={activity}
              onChangeText={setActivity}
            />

            {/* Chọn lặp daily/weekly */}
            <View style={styles.switchRow}>
              <View style={[styles.labelBox, !isWeekly ? styles.activeBoxBlue : null]}>
                <Text style={{ color: !isWeekly ? "#fff" : "#000" }}>Hàng ngày</Text>
              </View>
              <Switch
                value={isWeekly}
                onValueChange={() => setIsWeekly(!isWeekly)}
                thumbColor={"#fff"}
                trackColor={{ false: "#33CC66", true: "#f55" }}
              />
              <View style={[styles.labelBox, isWeekly ? styles.activeBoxRed : null]}>
                <Text style={{ color: isWeekly ? "#fff" : "#000" }}>Hàng tuần</Text>
              </View>
            </View>

            {/* Nhập điểm */}
            <Text style={styles.textActivities}>Nhập điểm:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 10"
              keyboardType="numeric"
              value={score}
              onChangeText={setScore}
            />

            {/* Chọn giờ bắt đầu */}
            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <Text style={styles.textActivities}>Thời gian bắt đầu:</Text>
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={(_, st) => {
                  if (st) setStartTime(st);
                }}
              />
            </View>

            {/* Nút TẠO */}
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
      />
    </PaperProvider>
  );
};

export default AddDevelopThinking;

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
