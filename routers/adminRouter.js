const express = require("express");
const { getDashboardStats, getTransactions } = require("../controller/adminController");
const router = express.Router();

// Có thể thêm middleware xác thực admin ở đây nếu muốn bảo mật
router.get("/dashboard-stats", getDashboardStats);
router.get("/transactions", getTransactions);

module.exports = router; 