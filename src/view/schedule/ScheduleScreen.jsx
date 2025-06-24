import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import themeContext from "../../context/themeContext";
import { PaperProvider } from "react-native-paper";
import HeaderScreen from "../../components/header/HeaderScreen";
import DateTimePicker from "@react-native-community/datetimepicker";
import { appInfo } from "../../constants/appInfos";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { getToken } from "../../ultis/authHelper";

const ScheduleScreen = ({ navigation }) => {
  const theme = useContext(themeContext);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allChild, setAllChild] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);

  const formatDate = (dateObj) =>
    dateObj.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Check if a date falls on the exact same day (ignoring time)
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Check if a selected date falls within a range
  const isDateInRange = (selectedDate, dateFrom, dateTo) => {
    const date = new Date(selectedDate);
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    // Set hours to 0 for clean date comparison (without time)
    date.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return date >= startDate && date <= endDate;
  };

  // const fetchScheduleByChild = async (childId, selectedDate = date) => {
  //   if (!childId) return;

  //   try {
  //     setLoading(true);
  //     const token = await getToken(dispatch);
  //     const res = await fetch(
  //       `${appInfo.BASE_URL}/api/schedule/child/${childId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);
  //     const data = await res.json();
  //     const allSchedules = data.data || [];

  //     console.log("All Schedules:", allSchedules);

  //     // Create a clean date object for selected date (remove time part)
  //     const cleanSelectedDate = new Date(selectedDate);
  //     cleanSelectedDate.setHours(0, 0, 0, 0);

  //     console.log("Selected Date for Filtering:", cleanSelectedDate);

  //     // Calculate the start and end of the week (Monday to Sunday)
  //     const startOfWeek = new Date(cleanSelectedDate);
  //     startOfWeek.setDate(
  //       cleanSelectedDate.getDate() - cleanSelectedDate.getDay() + 1
  //     ); // Set to Monday
  //     startOfWeek.setHours(0, 0, 0, 0); // Set time to midnight

  //     const endOfWeek = new Date(startOfWeek);
  //     endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Sunday
  //     endOfWeek.setHours(23, 59, 59, 999); // Set time to the end of the day

  //     console.log("Start of Week:", startOfWeek);
  //     console.log("End of Week:", endOfWeek);

  //     // Get the day of the week for the selected date (e.g., "Thứ 2" for Monday)
  //     const vietnameseDaysOfWeek = [
  //       "Chủ nhật",
  //       "Thứ 2",
  //       "Thứ 3",
  //       "Thứ 4",
  //       "Thứ 5",
  //       "Thứ 6",
  //       "Thứ 7",
  //     ];
  //     const selectedDayOfWeek =
  //       vietnameseDaysOfWeek[cleanSelectedDate.getDay()];

  //     console.log("Selected Day of Week:", selectedDayOfWeek);

  //     // Filter schedules for the week and the correct day of the week
  //     const filtered = allSchedules.filter((item) => {
  //       const scheduleDateFrom = new Date(item.dateFrom);
  //       const scheduleDateTo = new Date(item.dateTo);

  //       if (isNaN(scheduleDateFrom) || isNaN(scheduleDateTo)) {
  //         console.warn(
  //           `Invalid schedule date: ${item.dateFrom} or ${item.dateTo}`
  //         );
  //         return false;
  //       }

  //       // Set time to midnight for comparison (ensures time doesn't affect the check)
  //       scheduleDateFrom.setHours(0, 0, 0, 0);
  //       scheduleDateTo.setHours(0, 0, 0, 0);

  //       // Check if the schedule falls within the week range (from Monday to Sunday)
  //       const isWithinWeek =
  //         (scheduleDateFrom >= startOfWeek && scheduleDateFrom <= endOfWeek) ||
  //         (scheduleDateTo >= startOfWeek && scheduleDateTo <= endOfWeek) ||
  //         (scheduleDateFrom <= startOfWeek && scheduleDateTo >= endOfWeek);

  //       // Check if the schedule's `dayOfWeek` includes the selected day
  //       const isCorrectDayOfWeek = item.dayOfWeek.includes(selectedDayOfWeek);

  //       return isWithinWeek && isCorrectDayOfWeek;
  //     });

  //     console.log("Filtered Schedules for the Week and Day of Week:", filtered);

  //     setScheduleData(filtered.length > 0 ? filtered : []);
  //   } catch (error) {
  //     console.error("Lỗi khi lấy thời khóa biểu:", error.message);
  //     setScheduleData([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchScheduleByChild = async (childId, selectedDate = date) => {
    if (!childId) return;

    try {
      setLoading(true);
      const token = await getToken(dispatch);
      const res = await fetch(
        `${appInfo.BASE_URL}/api/schedule/child/${childId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);
      const data = await res.json();
      const allSchedules = data.data || [];

      console.log("All Schedules:", allSchedules);

      // Tạo đối tượng ngày (cleanSelectedDate) cho selectedDate, loại bỏ phần giờ để so sánh chỉ về ngày.
      const cleanSelectedDate = new Date(selectedDate);
      cleanSelectedDate.setHours(0, 0, 0, 0);

      // Lấy tên thứ của ngày được chọn (ví dụ: "Thứ 2")
      const vietnameseDaysOfWeek = [
        "Chủ nhật",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
      ];
      const selectedDayOfWeek =
        vietnameseDaysOfWeek[cleanSelectedDate.getDay()];
      console.log("Selected Day of Week:", selectedDayOfWeek);

      // Lọc danh sách lịch sao cho:
      // 1. Ngày được chọn nằm trong khoảng [dateFrom, dateTo] của lịch.
      // 2. Nếu lịch có trường dayOfWeek, thì ngày được chọn phải khớp với một trong các giá trị của dayOfWeek.
      const filtered = allSchedules.filter((item) => {
        // Kiểm tra và chuyển đổi ngày bắt đầu và ngày kết thúc của lịch
        const scheduleDateFrom = new Date(item.dateFrom);
        const scheduleDateTo = new Date(item.dateTo);
        scheduleDateFrom.setHours(0, 0, 0, 0);
        scheduleDateTo.setHours(0, 0, 0, 0);

        // Nếu ngày được chọn nằm ngoài khoảng [dateFrom, dateTo] thì loại bỏ lịch này.
        if (
          cleanSelectedDate < scheduleDateFrom ||
          cleanSelectedDate > scheduleDateTo
        ) {
          return false;
        }

        // Nếu lịch có trường dayOfWeek thì kiểm tra xem selectedDayOfWeek có được bao gồm không.
        if (item.dayOfWeek && !item.dayOfWeek.includes(selectedDayOfWeek)) {
          return false;
        }
        return true;
      });

      console.log("Filtered Schedules:", filtered);
      setScheduleData(filtered.length > 0 ? filtered : []);
    } catch (error) {
      console.error("Lỗi khi lấy thời khóa biểu:", error.message);
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchAllChild = async () => {
        setLoading(true);
        try {
          const token = await getToken(dispatch);
          const res = await fetch(`${appInfo.BASE_URL}/api/children`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          const children = (data.data || []).map((child) => ({
            ...child,
            fullName: child.name,
          }));

          setAllChild(children);
          if (children.length > 0) {
            const firstChild = children[0];
            setSelectedChild(firstChild);
            setValue(firstChild.fullName);
            setItems(
              children.map((child) => ({
                label: child.fullName,
                value: child.fullName,
              }))
            );
            fetchScheduleByChild(firstChild._id);
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách trẻ:", error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchAllChild();
    }, [dispatch])
  );

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === "ios");
    setDate(currentDate);
    if (selectedChild) {
      fetchScheduleByChild(selectedChild._id, currentDate);
    }
  };

  const handleChildChange = (valFunc) => {
    const selectedName = valFunc();
    setValue(selectedName);
    const selected = allChild.find((child) => child.fullName === selectedName);
    console.log("Selected Child:", selected);
    setSelectedChild(selected);
    if (selected) {
      fetchScheduleByChild(selected._id, date);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    Alert.alert(
      "Xoá thời khóa biểu",
      "Bạn có chắc muốn xoá thời khóa biểu này?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const token = await getToken(dispatch);
              const res = await fetch(
                `${appInfo.BASE_URL}/api/schedule/${scheduleId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (!res.ok) throw new Error(`Error: ${res.status}`);
              const data = await res.json();
              console.log("Delete Schedule:", data.message);

              // Refetch schedule after deleting
              if (selectedChild) {
                fetchScheduleByChild(selectedChild._id, date);
              }
            } catch (error) {
              console.error("Error deleting schedule:", error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, item.isExam ? styles.examCard : styles.lessonCard]}
      onLongPress={() => handleDeleteSchedule(item._id)}
      delayLongPress={500}
    >
      <Text style={styles.subject}>{item.subjectName}</Text>
      <Text style={styles.text}>
        Tiết: <Text style={styles.highlight}>{item.lessonPeriod}</Text>
      </Text>
      <Text style={styles.text}>
        Giáo viên: <Text style={styles.highlight}>{item.teacherName}</Text>
      </Text>
      <TouchableOpacity
        onPress={()=> navigation.navigate("UpdateSchedule", { item })} //replace edit function here
        style={{
          padding: 8,
          position: "absolute",
          top: 6,
          right: 6,
          backgroundColor: "yellow",
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "red" }}>Sửa</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <PaperProvider>
      <HeaderScreen
        title="Thời khóa biểu"
        showAddIcon="true"
        onPress={() => navigation.navigate("AddSchedule")}
      />
      <View style={styles.container}>
        {/* Dropdown chọn trẻ */}
        <View style={{ flex: 2, borderBottomWidth: 1 }}>
          {/* Chọn ngày */}
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={styles.datePickerBtn}
            >
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1.3 }}>
              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>
          </View>

          {/* choose child */}
          <View style={styles.dropdownWrapper}>
            <Text style={{ fontSize: 16 }}>Thời khóa biểu của:</Text>
            <View style={{ zIndex: 10, width: "60%" }}>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={handleChildChange}
                setItems={setItems}
                placeholder="Chọn trẻ"
                style={styles.dropdown}
                dropDownContainerStyle={{ zIndex: 1000 }}
              />
            </View>
          </View>
        </View>

        <View style={{ flex: 8.3 }}>
          {/* Loading */}
          {loading && <ActivityIndicator size="large" color="#33CC66" />}

          {/* Danh sách lịch học / thi */}
          {!loading && scheduleData.length === 0 ? (
            <View style={styles.noScheduleContainer}>
              <Image
                source={require("../../img/imgTab/run.png")}
                style={styles.image}
              />
              <Text style={styles.noText}>Không có lịch học cho ngày này</Text>
              <Text style={styles.noText}>
                Bạn hãy thêm thời khóa biểu cho ngày này
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("AddSchedule")}
              >
                <Text style={styles.addButtonText}>THÊM MỚI</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={scheduleData}
              keyExtractor={(item, index) => item._id || index.toString()}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}
        </View>

        {/* color lesson or exam */}
        <View style={{ flex: 0.7 }}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.circle, { backgroundColor: "cyan" }]} />
              <Text style={{ fontSize: 15 }}>Lịch học</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.circle, { backgroundColor: "red" }]} />
              <Text style={{ fontSize: 15 }}>Lịch thi</Text>
            </View>
          </View>
        </View>
      </View>
    </PaperProvider>
  );
};

export default ScheduleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  dropdownWrapper: {
    flexDirection: "row",
    height: 80,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  dropdown: {
    borderColor: "#ccc",
    zIndex: 1000,
  },
  datePickerBtn: {
    alignSelf: "center",
    backgroundColor: "#33CC66",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
    flex: 1,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 10,
  },
  dateText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  lessonCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#00BCD4",
  },
  examCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#FF5252",
  },
  subject: {
    color: "#00B0FF",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    paddingVertical: 3,
  },
  highlight: {
    color: "#33CC66",
  },
  noScheduleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  noText: {
    fontSize: 14,
    textAlign: "center",
  },
  addButton: {
    marginTop: 20,
    backgroundColor: "#33CC66",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
