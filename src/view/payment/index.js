import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createPayOSOrder } from '../../services/payosApi';
import { useSelector } from 'react-redux';
import { authSelector } from '../../redux/reducers/authReducer';

const PACKAGES = [
  { id: 1, name: 'Gói Cơ Bản', price: 100000, desc: 'Sử dụng 1 tháng' },
  { id: 2, name: 'Gói Nâng Cao', price: 250000, desc: 'Sử dụng 3 tháng' },
  { id: 3, name: 'Gói VIP', price: 900000, desc: 'Sử dụng 1 năm' },
];

const PaymentScreen = ({ route }) => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(PACKAGES[0]);
  const [loading, setLoading] = useState(false);
  
  // Lấy thông tin user từ Redux store
  const auth = useSelector(authSelector);

  const handlePayOSPayment = async () => {
    if (!auth.accesstoken) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để tiếp tục!');
      return;
    }
    
    setLoading(true);
    try {
      const { checkoutUrl } = await createPayOSOrder(selected.price, `Thanh toán ${selected.name}`, auth.accesstoken);
      setLoading(false);
      
      
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported) {
        await Linking.openURL(checkoutUrl);
      } else {
        Alert.alert('Lỗi', 'Không thể mở link thanh toán');
      }
    } catch (err) {
      setLoading(false);
      console.error('PayOS Error:', err);
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng PayOS. Vui lòng thử lại!');
    }
  };

  const renderPackage = ({ item }) => (
    <TouchableOpacity
      style={[styles.packageCard, selected.id === item.id && styles.selectedCard]}
      onPress={() => setSelected(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.packageName}>{item.name}</Text>
      <Text style={styles.packagePrice}>{item.price.toLocaleString()}đ</Text>
      <Text style={styles.packageDesc}>{item.desc}</Text>
      {selected.id === item.id && <Text style={styles.selectedText}>Đã chọn</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn gói dịch vụ</Text>
      <FlatList
        data={PACKAGES}
        renderItem={renderPackage}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 24 }}
      />
      <Button title="Thanh toán qua PayOS" onPress={handlePayOSPayment} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 16 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#6366f1' },
  packageCard: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 20, marginHorizontal: 8, alignItems: 'center', minWidth: 160 },
  selectedCard: { borderWidth: 2, borderColor: '#6366f1', backgroundColor: '#e0e7ff' },
  packageName: { fontSize: 18, fontWeight: 'bold', color: '#22223b' },
  packagePrice: { fontSize: 16, color: '#6366f1', marginVertical: 4 },
  packageDesc: { fontSize: 14, color: '#555', marginBottom: 8 },
  selectedText: { color: '#6366f1', fontWeight: 'bold', marginTop: 4 },
});

export default PaymentScreen; 