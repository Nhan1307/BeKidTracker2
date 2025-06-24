import { Linking, Alert, Platform } from "react-native";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { appInfo } from "../../constants/appInfos";

const VNP_RETURN_URL = `${appInfo.BASE_URL}/api/vnpay/return`;

const UnlockPerformanceChart = () => {
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVNPayPayment = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${appInfo.BASE_URL}/api/vnpay/create-payment-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 50000,
          description: "Mở khóa biểu đồ hiệu suất chi tiết",
        }),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        Alert.alert("Lỗi", "Phản hồi không hợp lệ từ server!");
        setLoading(false);
        return;
      }
      if (data.paymentUrl && /^https?:\/\//.test(data.paymentUrl)) {
        setPaymentUrl(data.paymentUrl);
      } else {
        Alert.alert("Lỗi", "Link thanh toán VNPay không hợp lệ!");
      }
    } catch (err) {
      console.error("Error:", err);
      Alert.alert("Lỗi", "Không thể tạo thanh toán VNPay!");
    } finally {
      setLoading(false);
    }
  };

  // Lắng nghe sự kiện điều hướng trong WebView
  const handleWebViewNavigationStateChange = (navState) => {
    if (navState.url && navState.url.startsWith(VNP_RETURN_URL)) {
      setPaymentUrl(null); // Đóng WebView
      Alert.alert("Thành công", "Bạn đã thanh toán thành công qua VNPay!");
      // Có thể gọi API kiểm tra trạng thái giao dịch tại đây nếu cần
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mở khóa biểu đồ chi tiết hiệu suất</Text>
      <TouchableOpacity style={styles.button} onPress={handleVNPayPayment} disabled={loading}>
        <Text style={styles.buttonText}>Thanh toán qua VNPay</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#33CC66" style={{ marginTop: 20 }} />}
      <Modal visible={!!paymentUrl} animationType="slide">
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          startInLoadingState
          renderLoading={() => <ActivityIndicator size="large" color="#33CC66" style={{ flex: 1 }} />}
        />
        <TouchableOpacity style={styles.closeButton} onPress={() => setPaymentUrl(null)}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Đóng</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  desc: { fontSize: 16, textAlign: "center", marginBottom: 24 },
  button: {
    backgroundColor: "#33CC66",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#33CC66",
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
});

export default UnlockPerformanceChart;