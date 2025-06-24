import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Appbar, DataTable, PaperProvider } from "react-native-paper";
import themeContext from "../../context/themeContext";
import { Ionicons } from "@expo/vector-icons";
import { getToken } from "../../ultis/authHelper";
import { appInfo } from "../../constants/appInfos";
import { useDispatch } from "react-redux";

const UserManagementScreen = ({ navigation }) => {
  const theme = useContext(themeContext);
  const [search, setSearch] = useState("");
  const [dataUser, setDataUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getToken(dispatch);
      const res = await fetch(`${appInfo.BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      // Map backend data to local format
      const users = (json.data || []).map((u) => ({
        id: u._id,
        name: u.fullname,
        email: u.email,
        timeJoin: new Date(u.createdAt).toLocaleDateString("vi-VN"),
        activity: new Date(u.updatedAt).toLocaleDateString("vi-VN"),
      }));
      setDataUser(users);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDeleteUser = (id) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa người dùng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken(dispatch);
            await fetch(`${appInfo.BASE_URL}/api/users/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchUsers();
          } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Xóa không thành công");
          }
        },
      },
    ]);
  };

  // Filtered list
  const filtered = dataUser.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <PaperProvider>
        <Appbar.Header style={{ backgroundColor: theme.background }}>
          <Appbar.Content title="Quản lý người dùng" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </PaperProvider>
    );

  return (
    <PaperProvider>
      <Appbar.Header style={{ backgroundColor: theme.background }}>
        <Appbar.Content title="Quản lý người dùng" />
      </Appbar.Header>
      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Tìm kiếm người dùng"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          <Ionicons name="search" size={24} />
        </View>
        {/* Table */}
        <ScrollView horizontal>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={styles.stt}>STT</DataTable.Title>
              <DataTable.Title style={styles.name}>Họ và tên</DataTable.Title>
              <DataTable.Title style={styles.email}>Email</DataTable.Title>
              <DataTable.Title style={styles.timeJoin}>
                Tham gia
              </DataTable.Title>
              <DataTable.Title style={styles.activity}>
                Hoạt động
              </DataTable.Title>
              <DataTable.Title style={styles.actions}>
                Hành động
              </DataTable.Title>
            </DataTable.Header>
            {filtered.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text>Không tìm thấy người dùng</Text>
              </View>
            ) : (
              filtered.map((item, idx) => (
                <DataTable.Row key={item.id}>
                  <DataTable.Cell style={styles.stt}>{idx + 1}</DataTable.Cell>
                  <DataTable.Cell style={styles.name}>
                    {item.name}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.email}>
                    {item.email}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.timeJoin}>
                    {item.timeJoin}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.activity}>
                    {item.activity}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.actions}>
                    <TouchableOpacity onPress={() => handleDeleteUser(item.id)}>
                      <Text style={{ color: "red" }}>Xóa</Text>
                    </TouchableOpacity>
                  </DataTable.Cell>
                </DataTable.Row>
              ))
            )}
          </DataTable>
        </ScrollView>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchWrapper: { flexDirection: "row", padding: 10, alignItems: "center" },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 40,
    marginRight: 8,
  },
  stt: { width: 50, justifyContent: "center" },
  name: { width: 150 },
  email: { width: 200 },
  timeJoin: { width: 150 },
  activity: { width: 150 },
  actions: { width: 100, flexDirection: "row", justifyContent: "space-around" },
  emptyContainer: { padding: 20, alignItems: "center" },
});

export default UserManagementScreen;
