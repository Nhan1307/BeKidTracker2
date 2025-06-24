import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

const AddActivitiesForUser = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* header */}
      <View
        style={{
          flex: 1.5,
          borderBottomWidth: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 20, marginTop: 20 }}>
          Thêm hoạt động
        </Text>
      </View>

      {/* content */}
      <View style={{ flex: 6.5, borderBottomWidth: 1 }}>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <View
            style={{
              flex: 3,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Tên hoạt động:
            </Text>
          </View>
          <View
            style={{ flex: 7, justifyContent: "center", alignItems: "center" }}
          >
            <TextInput
              placeholder="Vui lòng nhập tên hoạt động"
              style={{
                width: "95%",
                height: 50,
                borderRadius: 10,
                borderWidth: 1,
                paddingLeft: 10,
                borderColor: "#A7A6A6FF",
              }}
            />
          </View>
        </View>

        <View style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>Biểu tượng:</Text>
        </View>
      </View>

      {/* button */}
      <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            width: "80%",
            height: 60,
            borderRadius: 10,
            backgroundColor: "#4CAF50",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 20, color: "white" }}>
            Lưu
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddActivitiesForUser;

const styles = StyleSheet.create({});
