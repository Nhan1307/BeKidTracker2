import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import SuccessModal from '../../components/SuccessModal';

const HomeScreen = ({ route, navigation }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    console.log('route.params:', route.params);
    if (route?.params?.paymentSuccess) {
      setShowSuccess(true);
      navigation.setParams({ paymentSuccess: false });
    }
  }, [route?.params?.paymentSuccess]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>HomeScreen</Text>
      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Thanh toán thành công!"
        message="Bạn đã nạp gói thành công."
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
