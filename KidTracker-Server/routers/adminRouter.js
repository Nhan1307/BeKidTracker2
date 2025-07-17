const express = require("express");
const { getDashboardStats, getTransactions, getMonthlyStats, getAllUsers } = require("../controller/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

// Áp dụng middleware xác thực cho tất cả routes admin
router.use(authMiddleware);

router.get("/dashboard-stats", getDashboardStats);
router.get("/transactions", getTransactions);
router.get("/monthly-stats", getMonthlyStats);
router.get("/users", getAllUsers);

module.exports = router; 