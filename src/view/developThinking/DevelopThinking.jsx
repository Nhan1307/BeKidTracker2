import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import themeContext from "../../context/themeContext";
import { PaperProvider } from "react-native-paper";
import HeaderScreen from "../../components/header/HeaderScreen";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getToken } from "../../ultis/authHelper";
import { appInfo } from "../../constants/appInfos";
import { useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";

const DevelopThinking = ({ navigation }) => {
  const theme = useContext(themeContext);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);
  const [allChild, setAllChild] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [childActivities, setChildActivities] = useState([]);
  const [date, setDate] = useState(new Date());

  const getIconByTitle = (title) => {
    const icons = {
      "Học tập": "📘",
      "Vệ sinh cá nhân": "🧼",
      "Chạy bộ": "🏃",
      "Vui chơi": "🎮",
      "Ăn uống": "🍽️",
      "Đọc sách": "📚",
      Ngủ: "💤",
      "Thể dục": "🏋️",
      "Ngoài trời": "🌳",
      Nhạc: "🎵",
    };
    return icons[title] || "📌";
  };

  const getDurationFromNote = (note) => {
    const match = note?.match(/(\d+ phút)/);
    return match ? match[1] : "Không rõ";
  };

  // Hàm fetch danh sách lịch theo child và (tuỳ chọn) ngày được chọn
  // const fetchScheduleByChild = async (childId, selectedDate) => {
  //   if (!childId) {
  //     console.log("Child ID is missing!");
  //     return;
  //   }

  //   try {
  //     const token = await getToken(dispatch);
  //     const res = await fetch(`${appInfo.BASE_URL}/api/thoigianbieu/${childId}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     const data = await res.json();
  //     if (!res.ok) {
  //       throw new Error(data.message || "Lỗi khi tải thời gian biểu");
  //     }

  //     // Chuyển đổi dữ liệu, thêm trường dateFrom vào đối tượng kết quả
  //     const formatted = data.data.map((item) => {
  //       console.log("Raw schedule item:", item);
  //       return {
  //         id: item._id,
  //         title: item.title,
  //         icon: getIconByTitle(item.title),
  //         duration: getDurationFromNote(item.note),
  //         start: item.startTime
  //           ? new Date(`1970-01-01T${item.startTime}:00`).toLocaleTimeString("vi-VN", {
  //               hour: "2-digit",
  //               minute: "2-digit",
  //             })
  //           : "Không xác định",
  //         dateFrom: item.dateFrom, // Lưu lại ngày của lịch để so sánh
  //       };
  //     });

  //     // Nếu có selectedDate thì tiến hành lọc theo ngày
  //     if (selectedDate) {
  //       // Tạo một bản sao của selectedDate với giờ được set về 0
  //       const selected = new Date(selectedDate);
  //       selected.setHours(0, 0, 0, 0);

  //       const filtered = formatted.filter((schedule) => {
  //         if (!schedule.dateFrom) return false;
  //         const scheduleDate = new Date(schedule.dateFrom);
  //         scheduleDate.setHours(0, 0, 0, 0);
  //         return scheduleDate.getTime() === selected.getTime();
  //       });

  //       setChildActivities(filtered);
  //     } else {
  //       setChildActivities(formatted);
  //     }
  //   } catch (err) {
  //     console.error("Lỗi khi lấy thời gian biểu:", err.message);
  //     setChildActivities([]);
  //   }
  // };

  // Hàm fetch danh sách lịch theo child và (tuỳ chọn) ngày được chọn

  const fetchScheduleByChild = async (childId, selectedDate) => {
    if (!childId) {
      console.log("Child ID is missing!");
      return;
    }

    try {
      const token = await getToken(dispatch);
      const res = await fetch(
        `${appInfo.BASE_URL}/api/thoigianbieu/${childId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Lỗi khi tải thời gian biểu");
      }

      // Chuyển đổi dữ liệu, thêm trường dateFrom và repeat vào đối tượng kết quả
      const formatted = data.data.map((item) => {
        console.log("Raw schedule item:", item);
        return {
          id: item._id,
          title: item.title,
          icon: getIconByTitle(item.title),
          duration: getDurationFromNote(item.note),
          // start: item.startTime
          //   ? new Date(`1970-01-01T${item.startTime}:00`).toLocaleTimeString(
          //       "vi-VN",
          //       {
          //         hour: "2-digit",
          //         minute: "2-digit",
          //       }
          //     )
          //   : "Không xác định",
          start: item.startTime
            ? (() => {
                const [h, m] = item.startTime.split(":").map(Number);
                const d = new Date();
                d.setHours(h, m, 0, 0);
                return d.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              })()
            : "Không xác định",
          dateFrom: item.dateFrom, // Ngày bắt đầu của lịch (ở định dạng có thể parse được)
          repeat: item.repeat || "daily", // Nếu không có, mặc định là daily
          score: item.score,
        };
      });

      // Nếu có selectedDate thì tiến hành lọc theo kiểu lặp lại
      if (selectedDate) {
        // Tạo bản sao của selectedDate với giờ được set về 0
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);

        const filtered = formatted.filter((schedule) => {
          if (!schedule.dateFrom) return false;
          const scheduleDate = new Date(schedule.dateFrom);
          scheduleDate.setHours(0, 0, 0, 0);

          if (schedule.repeat === "daily") {
            // Lịch daily áp dụng cho mọi ngày từ ngày bắt đầu trở đi
            return selected.getTime() >= scheduleDate.getTime();
          } else if (schedule.repeat === "weekly") {
            // Lịch weekly áp dụng nếu ngày được chọn là ngày cách ngày bắt đầu đúng 7 ngày (bội số của 7)
            if (selected.getTime() < scheduleDate.getTime()) return false;
            const dayDifference =
              (selected.getTime() - scheduleDate.getTime()) /
              (1000 * 60 * 60 * 24);
            return dayDifference % 7 === 0;
          }
          return false;
        });

        setChildActivities(filtered);
      } else {
        setChildActivities(formatted);
      }
    } catch (err) {
      console.error("Lỗi khi lấy hoạt động nâng cao:", err.message);
      setChildActivities([]);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Xoá hoạt động", "Bạn có chắc muốn xoá hoạt động này?", [
      {
        text: "Huỷ",
        style: "cancel",
      },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken(dispatch);
            const res = await fetch(
              `${appInfo.BASE_URL}/api/thoigianbieu/${id}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || "Xoá thất bại");
            }

            fetchScheduleByChild(selectedChild._id, date);
          } catch (err) {
            console.error("Lỗi xoá:", err.message);
            Alert.alert("Lỗi", err.message || "Không thể xoá hoạt động");
          }
        },
      },
    ]);
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchAllChild = async () => {
        setLoading(true);
        try {
          const token = await getToken(dispatch);
          if (!token) {
            console.error("Không lấy được token");
            setLoading(false);
            return;
          }

          const res = await fetch(`${appInfo.BASE_URL}/api/children`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error(`Lỗi khi gọi API: ${res.status}`);
          }

          const data = await res.json();
          const children = data.data || [];

          const formattedChildren = children.map((child) => ({
            ...child,
            fullName: child.name,
          }));

          setAllChild(formattedChildren);
          if (formattedChildren.length > 0) {
            const firstChild = formattedChildren[0];
            setSelectedChild(firstChild);
            setValue(firstChild.fullName);
            setItems(
              formattedChildren.map((child) => ({
                label: child.fullName,
                value: child.fullName,
              }))
            );
            fetchScheduleByChild(firstChild._id, date);
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

  useEffect(() => {
    if (selectedChild) {
      fetchScheduleByChild(selectedChild._id, date);
    }
  }, [selectedChild]);

  const handleChildChange = (valFunc) => {
    const selectedName = valFunc();
    setValue(selectedName);
    const selected = allChild.find((child) => child.fullName === selectedName);
    setSelectedChild(selected);
  };

  if (loading) {
    return (
      <View style={styles.noScheduleContainer}>
        <ActivityIndicator size="large" color="#33CC66" />
        <Text style={styles.noText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === "ios");
    setDate(currentDate);
    if (selectedChild) {
      fetchScheduleByChild(selectedChild._id, currentDate);
    }
    // Sau khi chọn xong, tắt DateTimePicker
    setShowPicker(false);
  };

  const formatDate = (dateObj) =>
    dateObj.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Chỉ hiển thị những item có score (không phải null/undefined)
  const displayedActivities = childActivities.filter((item) => {
    // Bỏ qua nếu không có score
    if (item.score == null) return false;

    // Chuẩn bị 2 ngày với giờ = 0 để so sánh
    const sel = new Date(date);
    sel.setHours(0, 0, 0, 0);
    const start = new Date(item.dateFrom);
    start.setHours(0, 0, 0, 0);

    if (item.repeat === "daily") {
      // từ dateFrom trở đi
      return sel.getTime() >= start.getTime();
    }
    if (item.repeat === "weekly") {
      // nếu trước dateFrom thì bỏ
      if (sel.getTime() < start.getTime()) return false;
      // tính số ngày chênh lệch
      const diffDays = Math.round(
        (sel.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      // chỉ khi chênh lệch chia hết cho 7
      return diffDays % 7 === 0;
    }
    return false;
  });

  return (
    <PaperProvider>
      <HeaderScreen
        title="Hoạt động nâng cao"
        showAddIcon="true"
        onPress={() => navigation.navigate("AddDevelopThinking")}
      />
      <View style={styles.container}>
        <View style={styles.dropdownWrapper}>
          <Text style={{ fontSize: 16 }}>Hoạt động nâng cao của:</Text>
          <View style={{ zIndex: 10, width: "60%" }}>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={handleChildChange}
              setItems={setItems}
              style={styles.dropdown}
              dropDownContainerStyle={{ zIndex: 1000 }}
            />
          </View>
        </View>
        {/* Chọn ngày */}
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={styles.datePickerBtn}
        >
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
        {displayedActivities.length === 0 ? (
          <View style={styles.noScheduleContainer}>
            <Image
              source={require("../../img/imgTab/run.png")}
              style={styles.image}
            />
            <Text style={styles.noText}>Hiện tại không có hoạt động nào</Text>
            <Text style={styles.noText}>Bạn hãy tạo hoạt động cho trẻ</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("AddDevelopThinking")}
            >
              <Text style={styles.addButtonText}>Hoạt Động Nâng Cao MỚI</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView>
            {displayedActivities.map((item, index) => {
              const uniqueKey = item.id ? item.id.toString() : `temp-${index}`;
              console.log(item.score);

              return (
                <TouchableOpacity
                  key={uniqueKey}
                  onLongPress={() => handleDelete(item.id)}
                  delayLongPress={500}
                  style={styles.card}
                >
                  <Text style={styles.title}>
                    {item.title} {item.icon}
                  </Text>
                  <Text style={styles.textActivities}>
                    Điểm: <Text style={{ color: "#33CC66" }}>{item.score}</Text>
                  </Text>
                  <Text style={styles.textActivities}>
                    Thời gian bắt đầu:{" "}
                    <Text style={{ color: "#33CC66" }}>{item.start}</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </PaperProvider>
  );
};

export default DevelopThinking;

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: "#fff" },
  dropdownWrapper: {
    flexDirection: "row",
    height: 80,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  dropdown: {
    zIndex: 1000,
    borderColor: "#ccc",
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
  dateText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addButton: {
    marginTop: 20,
    backgroundColor: "#33CC66",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  datePickerBtn: {
    alignSelf: "center",
    backgroundColor: "#33CC66",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    marginTop: 10,
  },
  title: {
    color: "#00B0FF",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
  },
  textActivities: {
    paddingVertical: 5,
    fontSize: 16,
  },
});
