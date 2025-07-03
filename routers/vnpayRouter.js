const express = require("express");
const { createVNPayUrl, vnpayReturn, checkStatus, getHistory } = require("../controller/vnpayController");
const authMiddleware = require("../middlewares/errorMiddleWare");
const router = express.Router();
const Transaction = require('../models/transactionModel');

router.post("/create-payment-url", authMiddleware, createVNPayUrl);
router.get("/check-status", checkStatus);
router.get("/return", vnpayReturn);
router.get("/history", getHistory);
router.get('/all', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate) query.createdAt = { $gte: new Date(startDate) };
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (!query.createdAt) query.createdAt = {};
      query.createdAt.$lte = end;
    }
    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;