import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { DataTable, PaperProvider } from "react-native-paper";
import HeaderScreen from "../../components/header/HeaderScreen";
import themeContext from "../../context/themeContext";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { AntDesign } from "@expo/vector-icons";
import { getToken } from "../../ultis/authHelper";
import { appInfo } from "../../constants/appInfos";
import { useDispatch } from "react-redux";

const FollowAndEvaluation = () => {
  const theme = useContext(themeContext);
  const dispatch = useDispatch();

  const [activityStatus, setActivityStatus] = useState({});
  const [open, setOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  // state đánh dấu đã có báo cáo đánh giá hay chưa
  const [evaluationLoaded, setEvaluationLoaded] = useState(false);
  // State để theo dõi tổng điểm
  const [totalScore, setTotalScore] = useState(0);

  // Hàm lấy danh sách trẻ
  const getAllChild = async () => {
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
      console.log("Children data:", children);
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

  // Hàm lấy thời khóa biểu của trẻ theo id
  const getThoigianBieuByChild = async (childId) => {
    try {
      const token = await getToken(dispatch);
      if (!token) return;
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
      const scheduleData = data.data || [];
      console.log("Schedule data:", scheduleData);
      setSchedule(scheduleData);
    } catch (error) {
      console.error("Lỗi khi lấy thời khóa biểu:", error.message);
      Alert.alert("Lỗi", "Không thể tải thời khóa biểu");
    }
  };

  // Hàm lấy báo cáo đánh giá của trẻ theo ngày
  const getEvaluationReport = async (childId, date) => {
    try {
      const token = await getToken(dispatch);
      if (!token) return;

      const res = await fetch(
        `${
          appInfo.BASE_URL
        }/api/evaluation/get-evaluation?childId=${childId}&date=${moment(
          date
        ).format("YYYY-MM-DD")}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          console.log("Không có đánh giá cho ngày này.");
          return null; // Không có đánh giá
        }
        const errorData = await res.json();
        throw new Error(errorData.message || "Không thể tải đánh giá");
      }

      const data = await res.json();
      return data.data; // Trả về dữ liệu đánh giá
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error.message);
      Alert.alert("Lỗi", error.message || "Không thể tải đánh giá");
      return null;
    }
  };

  // Gọi getAllChild khi component mount
  useEffect(() => {
    getAllChild();
  }, []);

  // Khi thay đổi trẻ (value) hoặc ngày (date) sẽ kiểm tra có báo cáo đánh giá hay không
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy báo cáo đánh giá cho trẻ theo ngày (dùng UTC)
        const report = await getEvaluationReport(value, date);
        if (report) {
          // Nếu có báo cáo đánh giá: cập nhật trạng thái từ report
          const status = {};
          report.evaluations.forEach((evaluation) => {
            status[evaluation.activityId] = evaluation.status;
          });
          setActivityStatus(status);
          setEvaluationLoaded(true);

          // Tính toán tổng điểm từ các hoạt động đã hoàn thành
          updateTotalScore(status);
        } else {
          // Nếu không có báo cáo: reset trạng thái đánh giá
          setActivityStatus({});
          setEvaluationLoaded(false);
          setTotalScore(0);
        }
        // Dù có hay không báo cáo, ta vẫn load thời khóa biểu để hiển thị thông tin hoạt động
        await getThoigianBieuByChild(value);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (value && date) {
      fetchData();
    }
  }, [value, date]);

  // Hàm tính toán tổng điểm dựa trên trạng thái hoạt động hiện tại
  const updateTotalScore = (statuses) => {
    let score = 0;

    schedule.forEach((activity) => {
      if (statuses[activity._id] === "completed" && activity.score) {
        score += parseInt(activity.score) || 0;
      }
    });

    setTotalScore(score);
  };

  // Hàm xử lý đổi ngày từ DateTimePicker
  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Lọc thời khóa biểu theo ngày được chọn (dựa trên dateFrom)
  const filteredActivities = schedule.filter((activity) => {
    if (!activity.dateFrom) return false;
    const dateFromMoment = moment(activity.dateFrom);
    const selectedMoment = moment(date);
    if (selectedMoment.isBefore(dateFromMoment, "day")) return false;
    if (activity.repeat === "daily") {
      return true;
    } else if (activity.repeat === "weekly") {
      const diffDays = selectedMoment.diff(dateFromMoment, "days");
      return diffDays % 7 === 0;
    }
    return dateFromMoment.isSame(selectedMoment, "day");
  });

  // Tính ngày tạo sớm nhất dựa trên dateFrom của các lịch
  const scheduleDates = schedule
    .filter((activity) => activity.dateFrom)
    .map((activity) => moment(activity.dateFrom));
  const minScheduleDate =
    scheduleDates.length > 0 ? moment.min(scheduleDates) : null;

  // Hàm lấy thời gian bắt đầu: nếu có startTime (API) dùng nó, nếu không dùng start (dummy)
  const getStartTime = (item) => {
    return item.startTime ? item.startTime : item.start;
  };

  // Hàm lấy thời lượng: ưu tiên dùng trường duration, nếu không dùng note
  const getDuration = (item) => {
    if (item.duration) return item.duration + " phút";
    if (item.note) {
      const parts = item.note.split("-");
      if (parts.length > 1) return parts[1].trim();
    }
    return "";
  };

  // Hàm kiểm tra định dạng thời gian và trả về đối tượng moment
  const parseTime = (timeStr) => {
    if (timeStr.includes(":")) {
      return moment(timeStr, "HH:mm");
    }
    return moment(timeStr, "HH [giờ] mm [phút]");
  };

  // Cập nhật trạng thái hoạt động theo thời gian (ví dụ: đánh dấu "missed" sau 30 phút)
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityStatus((prevStatus) => {
        const updatedStatus = { ...prevStatus };
        schedule.forEach((activity) => {
          const timeString = getStartTime(activity);
          const startTime = parseTime(timeString);
          const endTime = startTime.clone().add(30, "minutes");
          const now = moment();
          if (
            now.isAfter(endTime) &&
            !updatedStatus[activity._id] &&
            !activity.score
          ) {
            updatedStatus[activity._id] = "missed";
          }
        });
        return updatedStatus;
      });
    }, 0);
    return () => clearInterval(interval);
  }, [schedule]);

  // Xử lý nút check đánh giá cho từng hoạt động
  const handleCheck = (id, timeStr, duration, score) => {
    // Kiểm tra ngày: chỉ cho phép đánh giá trong ngày hiện tại
    const today = moment().startOf("day");
    const selectedDay = moment(date).startOf("day");
    if (!selectedDay.isSame(today)) {
      Alert.alert(
        "Thông báo",
        `Chỉ có thể đánh giá trong ngày (${today.format("DD-MM-YYYY")})!`
      );
      return;
    }

    // Nếu hoạt động đã bị đánh dấu là "missed" thì không cho phép chỉnh sửa
    if (activityStatus[id] === "missed") return;
    const start = parseTime(timeStr);
    const now = moment();
    if (now.isBefore(start)) {
      Alert.alert("Thông báo", "Chưa đến giờ thực hiện hoạt động này!");
      return;
    }

    // Cho phép chỉnh sửa trạng thái: nếu đã đánh dấu "completed" sẽ bỏ đánh dấu, ngược lại đánh dấu
    setActivityStatus((prev) => {
      const currentStatus = prev[id];
      const newStatus = {
        ...prev,
        [id]: currentStatus === "completed" ? undefined : "completed",
      };

      // Cập nhật tổng điểm sau khi thay đổi trạng thái
      updateTotalScore(newStatus);
      return newStatus;
    });
  };

  // Hàm xử lý gửi đánh giá: tạo mới nếu chưa có báo cáo, cập nhật nếu đã có
  const handleSubmitEvaluation = () => {
    // Kiểm tra ngày: chỉ cho phép gửi khi ngày được chọn là ngày hiện tại
    const today = moment().startOf("day");
    const selectedDay = moment(date).startOf("day");
    if (!selectedDay.isSame(today)) {
      Alert.alert(
        "Thông báo",
        `Chỉ có thể gửi đánh giá trong ngày (${today.format("DD-MM-YYYY")})!`
      );
      return;
    }

    const confirmMessage = evaluationLoaded
      ? "Bạn có chắc chắn muốn cập nhật đánh giá không?"
      : "Bạn có chắc chắn muốn hoàn tất đánh giá không?";

    Alert.alert("Thông báo", confirmMessage, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            const token = await getToken(dispatch);
            if (!token) {
              Alert.alert("Lỗi", "Không thể lấy token người dùng!");
              return;
            }

            const evaluationData = filteredActivities.map((activity) => ({
              activityId: activity._id,
              status: activityStatus[activity._id] || "pending",
            }));

            // Nếu đã có báo cáo, gọi API cập nhật, ngược lại gọi API tạo mới
            const url = evaluationLoaded
              ? `${appInfo.BASE_URL}/api/evaluation/update`
              : `${appInfo.BASE_URL}/api/evaluation/complete`;
            const method = evaluationLoaded ? "PUT" : "POST";

            const response = await fetch(url, {
              method,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                childId: value,
                date: moment(date).utc().format("YYYY-MM-DD"),
                totalScore: totalScore,
                evaluations: evaluationData,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || "Gửi đánh giá thất bại");
            }

            const result = await response.json();
            Alert.alert(
              "Thành công",
              evaluationLoaded
                ? "Đánh giá đã được cập nhật thành công!"
                : "Đánh giá đã được hoàn tất thành công!"
            );
            console.log("Kết quả đánh giá:", result.data);
          } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error.message);
            Alert.alert("Lỗi", error.message || "Không thể gửi đánh giá");
          }
        },
      },
    ]);
  };

  // Tính số lượng đã hoàn thành dựa trên báo cáo nếu có, nếu không thì tính dựa trên trạng thái
  const completedCount = evaluationLoaded
    ? Object.values(activityStatus).filter((status) => status === "completed")
        .length
    : filteredActivities.filter(
        (activity) => activityStatus[activity._id] === "completed"
      ).length;
  const totalCount = filteredActivities.length;

  if (loading) {
    return (
      <PaperProvider>
        <HeaderScreen title="Theo dõi và đánh giá" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DAA4F" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <HeaderScreen title="Theo dõi và đánh giá" />
      {schedule.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text>Không có hoạt động để hiển thị</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Phần chọn ngày và dropdown danh sách trẻ */}
          <View style={{ flex: 2 }}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 2 }}>
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
              </View>
              <View style={{ flex: 1 }}>
                {/* Có thể thêm lựa chọn chế độ xem nếu cần */}
              </View>
            </View>
            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}
            <View
              style={{
                flexDirection: "row",
                flex: 1,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16 }}>Thời khóa biểu của:</Text>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                style={styles.dropdown}
                containerStyle={{ width: "60%" }}
                dropDownContainerStyle={{ zIndex: 1000 }}
              />
            </View>
          </View>

          {/* Thông báo trạng thái */}
          <View style={styles.statusContainer}>
            <Text style={styles.completedInfo}>
              {evaluationLoaded
                ? `Bảng đã được đánh giá (${completedCount} / ${totalCount} hoạt động đã hoàn thành)`
                : `Đã hoàn thành ${completedCount} / ${totalCount} hoạt động`}
            </Text>
            <Text style={styles.scoreInfo}>
              Tổng điểm: <Text style={styles.scoreValue}>{totalScore}</Text>
            </Text>
          </View>

          {/* Bảng hiển thị thời khóa biểu */}
          <View style={{ flex: 6 }}>
            {minScheduleDate &&
            moment(date).isBefore(minScheduleDate, "day") ? (
              <View style={styles.loadingContainer}>
                <Text>Chưa có lịch</Text>
              </View>
            ) : filteredActivities.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text>Không có lịch</Text>
              </View>
            ) : (
              <ScrollView horizontal>
                <ScrollView>
                  <DataTable>
                    <DataTable.Header style={styles.header}>
                      <DataTable.Title style={styles.columnSTT}>
                        STT
                      </DataTable.Title>
                      <DataTable.Title style={styles.columnActivity}>
                        Hoạt động
                      </DataTable.Title>
                      <DataTable.Title style={styles.columnTime}>
                        Thời gian
                      </DataTable.Title>
                      <DataTable.Title style={styles.columnDuration}>
                        Thời lượng
                      </DataTable.Title>
                      <DataTable.Title style={styles.columnDuration}>
                        Điểm
                      </DataTable.Title>
                      <DataTable.Title style={styles.columnStatus}>
                        Đánh giá
                      </DataTable.Title>
                    </DataTable.Header>
                    {filteredActivities.map((item, index) => {
                      const uniqueKey = item._id;
                      const displayTime = getStartTime(item);
                      const displayScore = item.score;
                      const displayDuration = item.duration
                        ? item.duration + " phút"
                        : getDuration(item);
                      return (
                        <DataTable.Row
                          key={uniqueKey}
                          onPress={() =>
                            handleCheck(
                              uniqueKey,
                              displayTime,
                              item.duration,
                              item.score
                            )
                          }
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? "#9895EE" : "#fff",
                          }}
                        >
                          <DataTable.Cell style={styles.columnSTT}>
                            {index + 1}
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.columnActivity}>
                            <Text style={styles.cellText}>{item.title}</Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.columnTime}>
                            {displayTime}
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.columnDuration}>
                            {displayDuration}
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.columnDuration}>
                            {displayScore}
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.columnStatus}>
                            {activityStatus[uniqueKey] === "completed" ? (
                              <AntDesign
                                name="checksquare"
                                size={24}
                                color="green"
                              />
                            ) : activityStatus[uniqueKey] === "missed" ? (
                              <AntDesign
                                name="closesquare"
                                size={24}
                                color="red"
                              />
                            ) : (
                              <AntDesign
                                name="checksquareo"
                                size={24}
                                color="gray"
                              />
                            )}
                          </DataTable.Cell>
                        </DataTable.Row>
                      );
                    })}
                  </DataTable>
                </ScrollView>
              </ScrollView>
            )}
          </View>
          <View>
            <Text style={{ fontSize: 16, marginTop: 10, color: "red" }}>
              Ghi chú: sau 30 phút không thực hiện hoạt động sẽ tự động đánh dấu
              là "missed"
            </Text>
          </View>
          {/* Nút gửi đánh giá (tạo mới hoặc cập nhật) */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmitEvaluation}
            >
              <Text style={styles.buttonText}>
                {evaluationLoaded ? "CẬP NHẬT ĐÁNH GIÁ" : "LƯU ĐÁNH GIÁ"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </PaperProvider>
  );
};

export default FollowAndEvaluation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2DAA4F",
  },
  datePicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginRight: 6,
    borderRadius: 6,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdown: {
    marginBottom: 15,
    borderColor: "#ccc",
  },
  header: {
    backgroundColor: "#D9D9D9",
  },
  columnSTT: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  columnActivity: {
    width: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  columnTime: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  columnDuration: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  columnStatus: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "80%",
    height: 60,
    borderRadius: 12,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
  },
  statusContainer: {
    marginBottom: 10,
    paddingVertical: 5,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  completedInfo: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2DAA4F",
  },
  scoreInfo: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
    fontWeight: "500",
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e74c3c",
  },
});
