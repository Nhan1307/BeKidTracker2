import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function FailScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán không thành công</Text>
      <Text style={styles.message}>Giao dịch của bạn đã bị hủy hoặc gặp lỗi.</Text>
      <Button title="Quay lại" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
}); 