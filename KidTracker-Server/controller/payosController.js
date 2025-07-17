const axios = require('axios');
const PayosTransaction = require('../models/payosTransactionModel');
const config = {
  client_id: process.env.PAYOS_CLIENT_ID,
  api_key: process.env.PAYOS_API_KEY,
  checksum_key: process.env.PAYOS_CHECKSUM_KEY,
  endpoint: 'https://api-merchant.payos.vn/v2/payment-requests',
};
console.log('PayOS endpoint thực tế:', config.endpoint);
exports.createOrder = async (req, res) => {
  try {
    console.log('=== CREATE ORDER REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers.authorization);
    console.log('req.user:', req.user);
    
    const { amount, description } = req.body;
   
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) {
      console.log('ERROR: userId is null');
      return res.status(401).json({ error: 'Không xác định được người dùng. Vui lòng đăng nhập lại.' });
    }
    
    console.log('userId found:', userId);
    
    const orderCodeNumber = Math.floor(Math.random() * 1000000000);
    console.log('Generated orderCode:', orderCodeNumber);
    
    
    console.log('PAYOS_CANCEL_URL:', process.env.PAYOS_CANCEL_URL);
    console.log('PAYOS_RETURN_URL:', process.env.PAYOS_RETURN_URL);
    console.log('PAYOS_CHECKSUM_KEY:', process.env.PAYOS_CHECKSUM_KEY ? 'EXISTS' : 'MISSING');
    
    
    const cleanDescription = "upgrade"; 
    
   
    const data = `amount=${amount}&cancelUrl=${process.env.PAYOS_CANCEL_URL}&description=${cleanDescription}&orderCode=${orderCodeNumber}&returnUrl=${process.env.PAYOS_RETURN_URL}`;
    console.log('Data for signature:', data);
    console.log('CHECKSUM_KEY length:', process.env.PAYOS_CHECKSUM_KEY?.length);
    
    const signature = require('crypto')
      .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY)
      .update(data)
      .digest('hex');
    
    console.log('Generated signature:', signature);
    
    const order = {
      orderCode: orderCodeNumber,
      amount,
      description: cleanDescription, 
      cancelUrl: process.env.PAYOS_CANCEL_URL,
      returnUrl: process.env.PAYOS_RETURN_URL,
      signature
    };
    
    console.log('Order object:', order);
    const payosRes = await axios.post(
      config.endpoint,
      order,
      {
        headers: {
          'x-client-id': config.client_id,
          'x-api-key': config.api_key,
          'Content-Type': 'application/json'
        }
      }
    );
    
       console.log('PayOS Response:', payosRes.data);
    
   
    const responseData = payosRes.data;
    if (!responseData || !responseData.data) {
      throw new Error('PayOS response không đúng định dạng');
    }
    
    const { checkoutUrl, id: payosTransactionId } = responseData.data;
    const transaction = await PayosTransaction.create({
      orderCode: orderCodeNumber.toString(),
      amount,
      description,
      status: 'pending',
      checkoutUrl,
      payosTransactionId,
      userId
    });
    res.json({ checkoutUrl, orderCode: orderCodeNumber.toString(), userId });
  } catch (err) {
    console.error('Lỗi tạo đơn hàng PayOS:', err.response ? err.response.data : err.message);
    res.status(500).json({ error: err.response ? err.response.data : err.message });
  }
};



exports.handleCallback = async (req, res) => {
  try {
    console.log('PayOS callback body:', req.body);
    
 
    const webhookData = req.body;
    
   
    let orderCode = webhookData.orderCode || webhookData.data?.orderCode;
    let status = webhookData.status || webhookData.data?.status;
    
  
    if (status === 'PAID') {
      status = 'success';
    } else if (status === 'CANCELLED') {
      status = 'failed';
    }
    
    console.log('Processing orderCode:', orderCode, 'status:', status);
    
    if (!orderCode) {
      return res.status(400).json({ error: 'OrderCode not found in callback data' });
    }
    
    const transaction = await PayosTransaction.findOneAndUpdate(
      { orderCode: orderCode?.toString() },
      { status },
      { new: true }
    );
    
    if (transaction) {
      console.log('Transaction updated successfully:', transaction);
    } else {
      console.log('Transaction not found for orderCode:', orderCode);
    }
    
    res.status(200).json({ success: true, transaction });
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).json({ error: err.message });
  }
};


exports.getTransactions = async (req, res) => {
  try {
    const transactions = await PayosTransaction.find().sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 