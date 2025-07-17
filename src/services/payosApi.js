import axios from 'axios';

export const createPayOSOrder = async (amount, description, accessToken) => {
// Thay đổi URL này để test local
const res = await axios.post('http://192.168.111.5:3000/api/payos/create-order', {
    amount,
    description
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return res.data; 
}; 