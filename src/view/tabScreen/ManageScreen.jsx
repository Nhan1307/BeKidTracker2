import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";

const ManageScreen = () => {
  const [schedule, setSchedule] = useState([
    { id: "1", time: "07:00", activity: "Dậy và đánh răng" },
    { id: "2", time: "08:00", activity: "Ăn sáng" },
  ]);
  const [newTime, setNewTime] = useState("");
  const [newActivity, setNewActivity] = useState("");

  const addSchedule = () => {
    if (newTime && newActivity) {
      const newItem = {
        id: Date.now().toString(),
        time: newTime,
        activity: newActivity,
      };
      setSchedule((prev) => [...prev, newItem]);
      setNewTime("");
      setNewActivity("");
    }
  };
  return (
    // <View style={styles.container}>
    //   <Text style={styles.header}>📝 Quản lý thời gian</Text>

    //   <View style={styles.inputContainer}>
    //     <TextInput
    //       style={styles.input}
    //       placeholder="Giờ (ví dụ: 09:00)"
    //       value={newTime}
    //       onChangeText={setNewTime}
    //     />
    //     <TextInput
    //       style={styles.input}
    //       placeholder="Hoạt động"
    //       value={newActivity}
    //       onChangeText={setNewActivity}
    //     />
    //     <TouchableOpacity style={styles.addButton} onPress={addSchedule}>
    //       <Text style={styles.addButtonText}>➕ Thêm</Text>
    //     </TouchableOpacity>
    //   </View>

    //   <FlatList
    //     data={schedule}
    //     keyExtractor={(item) => item.id}
    //     renderItem={({ item }) => (
    //       <View style={styles.card}>
    //         <Text style={styles.time}>{item.time}</Text>
    //         <Text style={styles.activity}>{item.activity}</Text>
    //       </View>
    //     )}
    //   />
    // </View>
    <View></View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  inputContainer: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#4a63f2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 6,
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
  },
  time: { fontSize: 16, fontWeight: "600", color: "#4a63f2" },
  activity: { fontSize: 16 },
});

export default ManageScreen;
