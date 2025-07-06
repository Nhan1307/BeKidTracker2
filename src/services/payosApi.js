import axios from 'axios';

export const createPayOSOrder = async (amount, description, userId) => {
  const res = await axios.post('https://c2de-2001-ee0-4fd7-f7a0-cdf1-4913-429f-1b0a.ngrok-free.app/api/payos/create-order', {
    amount,
    description,
    userId
  });
  return res.data; // { checkoutUrl, orderCode }
}; 