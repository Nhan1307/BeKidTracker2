import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useState } from "react";
import themeContext from "../../context/themeContext";
import { PaperProvider } from "react-native-paper";
import HeaderScreen from "../../components/header/HeaderScreen";
import { getToken } from "../../ultis/authHelper";
import { useDispatch } from "react-redux";
import { appInfo } from "../../constants/appInfos";
import { useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";

const Children = ({ navigation }) => {
  const theme = useContext(themeContext);
  const [allChild, setAllChild] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   const fetchAllChild = async () => {
  //     try {
  //       const token = await getToken(dispatch);
  //       if (!token) {
  //         console.error("Không lấy được token");
  //         return;
  //       }

  //       console.log("Token gửi đi:", token);

  //       const res = await fetch(`${appInfo.BASE_URL}/api/children`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (!res.ok) {
  //         throw new Error(`Lỗi khi gọi API: ${res.status}`);
  //       }

  //       const data = await res.json();
  //       setAllChild(data.data);
  //       if (data.data.length > 0) {
  //         setSelectedChild(data.data[0]);
  //       }
  //       console.log("Danh sách trẻ nhận được:", data.data);
  //     } catch (error) {
  //       console.error("Lỗi khi lấy danh sách trẻ:", error.message);
  //     }
  //   };

  //   fetchAllChild();
  // }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchAllChild = async () => {
        try {
          const token = await getToken(dispatch);
          if (!token) {
            console.error("Không lấy được token");
            return;
          }

          console.log("Token gửi đi:", token);

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
          setAllChild(data.data);

          if (data.data.length > 0) {
            setSelectedChild(data.data[0]);
          }
          console.log("Danh sách trẻ nhận được:", data.data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách trẻ:", error.message);
        }
      };

      fetchAllChild();
    }, [])
  );

  const confirmDeleteChild = () => {
    Alert.alert(
      "Xác nhận xoá",
      `Bạn có chắc chắn muốn xoá hồ sơ của ${selectedChild?.name}?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: deleteChild, style: "destructive" },
      ]
    );
  };

  const deleteChild = async () => {
    if (!selectedChild) return;

    try {
      const token = await getToken(dispatch);
      if (!token) {
        console.error("Không lấy được token");
        return;
      }

      const res = await fetch(
        `${appInfo.BASE_URL}/api/children/${selectedChild._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Lỗi khi gọi API: ${res.status}`);
      }

      // Cập nhật danh sách sau khi xóa
      setAllChild(allChild.filter((child) => child._id !== selectedChild._id));

      // Chọn trẻ khác nếu danh sách còn
      if (allChild.length > 1) {
        setSelectedChild(
          allChild.find((child) => child._id !== selectedChild._id)
        );
      } else {
        setSelectedChild(null);
      }

      console.log("Xóa hồ sơ trẻ thành công");
    } catch (error) {
      console.error("Lỗi khi xóa hồ sơ trẻ:", error.message);
    }
  };

  const childItem = ({ item }) => (
    <TouchableOpacity
      style={{
        width: "95%",
        height: 125,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#d0d0d0",
        marginHorizontal: 6,
        marginVertical: 6,
        paddingHorizontal: 12,
        justifyContent: "center",
      }}
      onPress={() => setSelectedChild(item)}
    >
      <Text style={styles.childText}>🧑 Họ tên: {item.name}</Text>
      <Text style={styles.childText}>
        ⚧️ Giới tính: {item.gender === "male" ? "nam" : "nữ"}
      </Text>
      <Text style={styles.childText}>
        🎂 Ngày sinh: {format(new Date(item.dateOfBirth), "dd/MM/yyyy")}
      </Text>

      <Text style={styles.childText}>🏅 Cấp bậc: {item.level}</Text>
    </TouchableOpacity>
  );

  return (
    <PaperProvider>
      <HeaderScreen
        title="Quản lý trẻ"
        showAddIcon={true}
        onPress={() => navigation.navigate("AddChildren")}
      />
      {allChild.length === 0 ? (
        <View style={styles.noScheduleContainer}>
          <Image
            source={require("../../img/imgTab/children_1.png")}
            style={styles.image}
          />
          <Text style={styles.noText}>Hiện tại không có hồ sơ trẻ</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddChildren")}
          >
            <Text style={styles.addButtonText}>THÊM HỒ SƠ CỦA TRẺ MỚI</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <View
            style={{
              flex: 2.5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={styles.title}>Hiện tại bạn đang quản lý trẻ</Text>
            {selectedChild && (
              <View style={styles.selectedChildCard}>
                {selectedChild.gender === "male" ? (
                  <Image
                    source={{ uri: "https://avatar.iran.liara.run/public/boy" }}
                    style={styles.selectedChildImage}
                  />
                ) : (
                  <Image
                    source={{
                      uri: "https://avatar.iran.liara.run/public/girl",
                    }}
                    style={styles.selectedChildImage}
                  />
                )}
                <Text
                  style={{ paddingTop: 8, fontSize: 17, fontWeight: "bold" }}
                >
                  {selectedChild.name}
                </Text>
              </View>
            )}
          </View>

          <View style={{ flex: 5 }}>
            <FlatList
              data={allChild}
              keyExtractor={(item) => item._id}
              renderItem={childItem}
            />
          </View>
          <View style={{ flex: 2.5 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={confirmDeleteChild}
            >
              <Text style={styles.buttonText}>Xóa hồ sơ trẻ hiện tại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate("UpdateChildren", { child: selectedChild })
              }
            >
              <Text style={styles.buttonText}>
                Chỉnh sửa hồ sơ trẻ hiện tại
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </PaperProvider>
  );
};

export default Children;

const styles = StyleSheet.create({
  noScheduleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
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
  image: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  container: { flex: 1, padding: 10 },
  title: { fontSize: 20, fontWeight: "bold", paddingTop: 5 },
  selectedChildContainer: {
    flex: 1.5,
    alignItems: "center",
  },
  selectedChildCard: {
    width: 200,
    height: 120,
    borderRadius: 15,
    backgroundColor: "#fff",
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#d0d0d0",
  },
  selectedChildImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  selectedChildName: {
    fontSize: 18,
    paddingTop: 10,
  },
  childItem: {
    width: 150,
    height: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    marginHorizontal: 6,
    alignItems: "center",
  },
  childImage: {
    width: 90,
    height: 65,
    resizeMode: "contain",
    paddingTop: 12,
  },
  childText: {
    fontSize: 16,
    paddingTop: 7,
  },
  buttonContainer: {
    flex: 3,
  },
  button: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
