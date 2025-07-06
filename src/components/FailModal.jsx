import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FailModal({ visible, onClose, title, message }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Ionicons name="close-circle" size={64} color="#FF3B30" style={{ marginBottom: 12 }} />
          <Text style={styles.title}>{title || "Thanh toán thất bại!"}</Text>
          <Text style={styles.message}>{message || "Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ."}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'
  },
  modal: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', width: 320
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FF3B30', marginBottom: 8 },
  message: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: {
    backgroundColor: '#FF3B30', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
}); 