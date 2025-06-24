import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
  FlatList,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import { PaperProvider, Checkbox } from "react-native-paper"; // Sử dụng Checkbox thay cho RadioButton
import moment from "moment";
import HeaderScreen from "../../components/header/HeaderScreen";
import { appInfo } from "../../constants/appInfos";
import { useDispatch } from "react-redux";
import { getToken } from "../../ultis/authHelper";

const AddSchedule = ({ navigation }) => {
  const dispatch = useDispatch();
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [showPickerFrom, setShowPickerFrom] = useState(false);
  const [showPickerTo, setShowPickerTo] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [lessons, setLessons] = useState("");
  const [openChild, setOpenChild] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [isExam, setIsExam] = useState(false);
  const [isWeekly, setIsWeekly] = useState(true);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [checked, setChecked] = useState([]); // Dùng mảng để lưu các ngày được chọn

  const [day, setDay] = useState([
    { id: 1, label: "Thứ 2", value: "Thứ 2" },
    { id: 2, label: "Thứ 3", value: "Thứ 3" },
    { id: 3, label: "Thứ 4", value: "Thứ 4" },
    { id: 4, label: "Thứ 5", value: "Thứ 5" },
    { id: 5, label: "Thứ 6", value: "Thứ 6" },
    { id: 6, label: "Thứ 7", value: "Thứ 7" },
    { id: 7, label: "Chủ Nhật", value: "Chủ Nhật" },
    { id: 8, label: "Tất cả", value: "Tất cả" },
  ]);

  useEffect(() => {
    if (openChild) setOpenTime(false);
  }, [openChild]);

  useEffect(() => {
    if (openTime) setOpenChild(false);
  }, [openTime]);

  // Fetch children data and update dropdown items
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

  const onChangeDateFrom = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPickerFrom(Platform.OS === "ios");
    setShowPickerFrom(!showPickerFrom);
    setDateFrom(currentDate);
  };

  const onChangeDateTo = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPickerTo(Platform.OS === "ios");
    setShowPickerTo(!showPickerTo);
    setDateTo(currentDate);
  };

  // Form validation function
  const validateForm = () => {
    if (!subjectName || !teacherName || !lessons || checked.length === 0) {
      Alert.alert(
        "Lỗi",
        "Vui lòng điền đầy đủ thông tin và chọn ít nhất một ngày"
      );
      return false;
    }
    return true;
  };

  // Format date using moment.js
  const formatDate = (date) => {
    return moment(date).format("DD/MM/YYYY");
  };

  // Submit the form
  const handleCreate = async () => {
    if (!validateForm()) return;

    const scheduleData = {
      dateFrom: formatDate(dateFrom),
      dateTo: formatDate(dateTo),
      subjectName,
      teacherName,
      lessonPeriod: lessons,
      isExam,
      isWeekly,
      childId: value,
      dayOfWeek: checked, // Gửi mảng các ngày đã chọn
    };

    try {
      const token = await getToken(dispatch);
      if (!token) return;

      const res = await fetch(`${appInfo.BASE_URL}/api/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleData),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Thành công", "Lịch học đã được tạo");
        navigation.goBack();
      } else {
        Alert.alert("Lỗi", data.message || "Không thể tạo lịch học");
      }
    } catch (error) {
      console.error("Lỗi khi tạo lịch học:", error.message);
      Alert.alert("Lỗi", "Không thể tạo lịch học");
    }
  };

  const toggleDay = (dayValue) => {
    setChecked(
      (prevChecked) =>
        prevChecked.includes(dayValue)
          ? prevChecked.filter((day) => day !== dayValue) // Xóa ngày khỏi mảng nếu đã chọn
          : [...prevChecked, dayValue] // Thêm ngày vào mảng nếu chưa chọn
    );
  };

  return (
    <PaperProvider>
      <HeaderScreen title="Tạo thời khóa biểu mới" />
      <FlatList
        data={[{}]} // Truyền 1 mảng dummy để FlatList có thể render
        renderItem={() => (
          <View style={{ flex: 1 }}>
            <View style={styles.container}>
              {/* Child Dropdown */}
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
              {/* Date Picker */}
              <View>
                <Text style={styles.textActivities}>Từ ngày: </Text>
                <TouchableOpacity
                  onPress={() => setShowPickerFrom(!showPickerFrom)}
                  style={styles.datePicker}
                >
                  <Text>
                    Ngày {dateFrom.getDate()}, Tháng {dateFrom.getMonth() + 1},{" "}
                    {dateFrom.getFullYear()}
                  </Text>
                  <Ionicons name="chevron-down" size={20} />
                </TouchableOpacity>
                {showPickerFrom && (
                  <DateTimePicker
                    value={dateFrom}
                    mode="date"
                    display="default"
                    onChange={onChangeDateFrom}
                    style={{ marginBottom: 12 }}
                  />
                )}
              </View>
              <View>
                <Text style={styles.textActivities}>Đến ngày: </Text>
                <TouchableOpacity
                  onPress={() => setShowPickerTo(!showPickerTo)}
                  style={styles.datePicker}
                >
                  <Text>
                    Ngày {dateTo.getDate()}, Tháng {dateTo.getMonth() + 1},{" "}
                    {dateTo.getFullYear()}
                  </Text>
                  <Ionicons name="chevron-down" size={20} />
                </TouchableOpacity>
                {showPickerTo && (
                  <DateTimePicker
                    value={dateTo}
                    mode="date"
                    display="default"
                    onChange={onChangeDateTo}
                    style={{ marginBottom: 12 }}
                  />
                )}
              </View>
              <View>
                <Text style={styles.textActivities}>Chọn thứ: </Text>
                <View>
                  <FlatList
                    keyExtractor={(index) => index.id.toString()}
                    numColumns={4}
                    data={day}
                    renderItem={({ item }) => (
                      <View style={{ flexDirection: "row" }}>
                        <Checkbox
                          status={
                            checked.includes(item.value)
                              ? "checked"
                              : "unchecked"
                          }
                          onPress={() => toggleDay(item.value)} // Thêm hoặc xóa ngày khỏi mảng khi nhấn
                        />
                        <Text style={{ fontSize: 16, marginTop: 7 }}>
                          {item.label}
                        </Text>
                      </View>
                    )}
                  />
                </View>
              </View>
              {/* Text Inputs */}
              <Text style={styles.textActivities}>Tên môn học: </Text>
              <TextInput
                placeholder="Tên môn học"
                style={styles.input}
                value={subjectName}
                onChangeText={setSubjectName}
              />
              <Text style={styles.textActivities}>Tên giáo viên: </Text>
              <TextInput
                placeholder="Tên giảng viên giảng dạy"
                style={styles.input}
                value={teacherName}
                onChangeText={setTeacherName}
              />
              {/* DropDown for Tiết học */}
              <Text style={styles.textActivities}>Tiết học: </Text>
              <TextInput
                placeholder="Chọn tiết học"
                style={styles.input}
                value={lessons}
                onChangeText={setLessons}
              />
              {/* Switch: Lịch học / Lịch thi */}
              <View style={styles.switchRow}>
                <View
                  style={[
                    styles.labelBox,
                    !isExam ? styles.activeBoxBlue : null,
                  ]}
                >
                  <Text style={{ color: !isExam ? "#fff" : "#000" }}>
                    Lịch học
                  </Text>
                </View>
                <Switch
                  value={isExam}
                  onValueChange={() => setIsExam(!isExam)}
                  thumbColor={isExam ? "#fff" : "#fff"}
                  trackColor={{ false: "#ccc", true: "red" }}
                />
                <View
                  style={[styles.labelBox, isExam ? styles.activeBoxRed : null]}
                >
                  <Text style={{ color: isExam ? "#fff" : "#000" }}>
                    Lịch thi
                  </Text>
                </View>
              </View>
              {/* Weekly toggle */}
              {/* <View style={styles.switchRow}>
                <Text>Bổ sung thành định kỳ hàng tuần</Text>
                <Ionicons
                  name={
                    isWeekly ? "checkmark-circle-outline" : "ellipse-outline"
                  }
                  size={24}
                  color={isWeekly ? "green" : "#ccc"}
                  onPress={() => setIsWeekly(!isWeekly)}
                  style={{ marginLeft: 8 }}
                />
              </View> */}
              {/* Submit Button */}
              <TouchableOpacity style={styles.button} onPress={handleCreate}>
                <Text style={styles.buttonText}>TẠO LỊCH</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  datePicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    flexDirection: "row",
    marginTop: 5,
    justifyContent: "space-between",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  textActivities: {
    fontSize: 16,
    marginTop: 15,
  },
  dropdown: {
    height: 45,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 15,
    marginTop: 5,
  },
  labelBox: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activeBoxBlue: {
    backgroundColor: "blue",
  },
  activeBoxRed: {
    backgroundColor: "red",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
});

export default AddSchedule;
