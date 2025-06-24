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
import { Ionicons } from "@expo/vector-icons";
import { PaperProvider, Checkbox } from "react-native-paper";
import moment from "moment";
import HeaderScreen from "../../components/header/HeaderScreen";
import { appInfo } from "../../constants/appInfos";
import { useDispatch } from "react-redux";
import { getToken } from "../../ultis/authHelper";

const Form = ({
  childName,
  dateFrom,
  dateTo,
  showPickerFrom,
  showPickerTo,
  setShowPickerFrom,
  setShowPickerTo,
  setDateFrom,
  setDateTo,
  subjectName,
  setSubjectName,
  teacherName,
  setTeacherName,
  lessons,
  setLessons,
  isExam,
  setIsExam,
  checked,
  toggleDay,
  handleUpdate,
}) => {
  const dayOptions = [
    { id: 1, label: "Thứ 2", value: "Thứ 2" },
    { id: 2, label: "Thứ 3", value: "Thứ 3" },
    { id: 3, label: "Thứ 4", value: "Thứ 4" },
    { id: 4, label: "Thứ 5", value: "Thứ 5" },
    { id: 5, label: "Thứ 6", value: "Thứ 6" },
    { id: 6, label: "Thứ 7", value: "Thứ 7" },
    { id: 7, label: "Chủ Nhật", value: "Chủ Nhật" },
  ];

  const onChangeDate = (setter, hidePicker) => (_, selected) => {
    const current = selected || (setter === setDateFrom ? dateFrom : dateTo);
    setter(current);
    if (Platform.OS !== "ios") hidePicker(false);
  };

  return (
    <View>
      <Text style={styles.label}>Tên trẻ: <Text style={styles.childName}>{childName}</Text></Text> 
      

      <Text style={styles.label}>Từ ngày:</Text>
      <TouchableOpacity
        style={styles.datePickerBtn}
        onPress={() => setShowPickerFrom(true)}
      >
        <Text style={styles.dateText}>
          {moment(dateFrom).format("DD/MM/YYYY")}
        </Text>
        <Ionicons name="chevron-down" size={20} />
      </TouchableOpacity>
      {showPickerFrom && (
        <DateTimePicker
          value={dateFrom}
          mode="date"
          display="default"
          onChange={onChangeDate(setDateFrom, setShowPickerFrom)}
        />
      )}

      <Text style={styles.label}>Đến ngày:</Text>
      <TouchableOpacity
        style={styles.datePickerBtn}
        onPress={() => setShowPickerTo(true)}
      >
        <Text style={styles.dateText}>
          {moment(dateTo).format("DD/MM/YYYY")}
        </Text>
        <Ionicons name="chevron-down" size={20} />
      </TouchableOpacity>
      {showPickerTo && (
        <DateTimePicker
          value={dateTo}
          mode="date"
          display="default"
          onChange={onChangeDate(setDateTo, setShowPickerTo)}
        />
      )}

      <Text style={styles.label}>Chọn thứ:</Text>
      <View style={styles.weekRow}>
        {dayOptions.map((d) => (
          <View key={d.value} style={styles.dayRow}>
            <Checkbox
              status={checked.includes(d.value) ? 'checked' : 'unchecked'}
              onPress={() => toggleDay(d.value)}
            />
            <Text style={styles.dayLabel}>{d.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.label}>Tên môn học:</Text>
      <TextInput
        style={styles.input}
        value={subjectName}
        onChangeText={setSubjectName}
      />

      <Text style={styles.label}>Tên giáo viên:</Text>
      <TextInput
        style={styles.input}
        value={teacherName}
        onChangeText={setTeacherName}
      />

      <Text style={styles.label}>Tiết học:</Text>
      <TextInput
        style={styles.input}
        value={lessons}
        onChangeText={setLessons}
      />

      <View style={styles.switchRow}>
        <View style={[styles.labelBox, !isExam && styles.activeBoxBlue]}>
          <Text style={!isExam && styles.whiteText}>Lịch học</Text>
        </View>
        <Switch value={isExam} onValueChange={() => setIsExam(!isExam)} />
        <View style={[styles.labelBox, isExam && styles.activeBoxRed]}>
          <Text style={isExam && styles.whiteText}>Lịch thi</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>CẬP NHẬT</Text>
      </TouchableOpacity>
    </View>
  );
};

const UpdateSchedule = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { item } = route.params;
console.log(item);

  const parseDate = (dateStr) => (dateStr ? new Date(dateStr) : new Date());

  const [dateFrom, setDateFrom] = useState(parseDate(item.dateFrom));
  const [dateTo, setDateTo] = useState(parseDate(item.dateTo));
  const [showPickerFrom, setShowPickerFrom] = useState(false);
  const [showPickerTo, setShowPickerTo] = useState(false);
  const [subjectName, setSubjectName] = useState(item.subjectName || "");
  const [teacherName, setTeacherName] = useState(item.teacherName || "");
  const [lessons, setLessons] = useState(item.lessonPeriod || "");
  const [isExam, setIsExam] = useState(item.isExam);
  const [checked, setChecked] = useState(item.dayOfWeek || []);
  const [items, setItems] = useState([]);
  const [value, setValue] = useState(item.child);
  const [loading, setLoading] = useState(false);

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

  const toggleDay = (d) => {
    setChecked((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const validateForm = () => {
    if (!subjectName || !teacherName || !lessons || checked.length === 0) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const payload = {
      dateFrom: moment(dateFrom).format("DD/MM/YYYY"),
      dateTo: moment(dateTo).format("DD/MM/YYYY"),
      subjectName,
      teacherName,
      lessonPeriod: lessons,
      isExam,
      childId: value,
      dayOfWeek: checked,
    };
    try {
      const token = await getToken(dispatch);
      const res = await fetch(
        `${appInfo.BASE_URL}/api/schedule/${item._id}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }
      );
      const json = await res.json();
      if (res.ok) {
        Alert.alert("Thành công", "Cập nhật thành công");
        navigation.goBack();
      } else {
        Alert.alert("Lỗi", json.message || "Thất bại");
      }
    } catch {
      Alert.alert("Lỗi mạng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <HeaderScreen title="Cập nhật thời khóa biểu" />
      <FlatList
        data={[]}
        ListHeaderComponent={
          <Form
            childName={childName}
            dateFrom={dateFrom}
            dateTo={dateTo}
            showPickerFrom={showPickerFrom}
            showPickerTo={showPickerTo}
            setShowPickerFrom={setShowPickerFrom}
            setShowPickerTo={setShowPickerTo}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
            subjectName={subjectName}
            setSubjectName={setSubjectName}
            teacherName={teacherName}
            setTeacherName={setTeacherName}
            lessons={lessons}
            setLessons={setLessons}
            isExam={isExam}
            setIsExam={setIsExam}
            checked={checked}
            toggleDay={toggleDay}
            handleUpdate={handleUpdate}
          />
        }
        keyExtractor={() => 'form'}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  label: { fontSize: 16, marginTop: 12, marginBottom: 6 },
  childName: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 12 },
  dateText: { fontSize: 16 },
  weekRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  dayRow: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  dayLabel: { marginLeft: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  labelBox: { padding: 8, borderRadius: 12, marginHorizontal: 10 },
  activeBoxBlue: { backgroundColor: 'blue' },
  activeBoxRed: { backgroundColor: 'red' },
  whiteText: { color: '#fff' },
  button: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default UpdateSchedule;