const UserModel = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const Evaluation = require("../models/evalutionModel");

// Lấy tổng hợp số liệu dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalEvaluations = await Evaluation.countDocuments();
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, sum: { $sum: "$amount" } } }
    ]);
    const revenue = totalRevenue[0]?.sum || 0;

    // Số lượng từng gói đã bán
    const packageStats = await Transaction.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: "$description", count: { $sum: 1 }, total: { $sum: "$amount" } } }
    ]);

    res.json({
      totalUsers,
      totalTransactions,
      totalEvaluations,
      revenue,
      packageStats
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Lấy danh sách giao dịch (có phân trang, lọc)
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, description } = req.query;
    const query = {};
    if (status) query.status = status;
    if (description) query.description = description;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

    res.json({ total, transactions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Lấy thống kê theo tháng
exports.getMonthlyStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          revenue: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "success"] }, "$amount", 0] 
            } 
          },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    // Lấy thống kê người dùng theo tháng
    const userStats = await UserModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          users: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    // Tạo dữ liệu đầy đủ cho 12 tháng
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = months.map((month, index) => {
      const monthNum = index + 1;
      const revenueData = monthlyData.find(d => d._id.month === monthNum) || { revenue: 0, transactions: 0 };
      const userData = userStats.find(d => d._id.month === monthNum) || { users: 0 };
      
      return {
        month,
        revenue: revenueData.revenue,
        transactions: revenueData.transactions,
        users: userData.users
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Lấy danh sách tất cả người dùng (chỉ admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const users = await UserModel.find({})
      .select('fullname email age createdAt role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await UserModel.countDocuments();

    res.json({ 
      total, 
      users,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};