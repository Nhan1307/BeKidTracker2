const qs = require("qs");
const crypto = require("crypto");
const moment = require("moment-timezone");
const Transaction = require("../models/transactionModel");
const mongoose = require('mongoose');

exports.createVNPayUrl = async (req, res) => {
  console.log("[createVNPayUrl] Bắt đầu tạo URL thanh toán");
  console.log("[createVNPayUrl] req.body:", req.body);
  console.log("[createVNPayUrl] req.user:", req.user);
  
  const { amount, description } = req.body;
  console.log("[createVNPayUrl] req.user._id:", req.user?._id);
  
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;
  
  console.log("[createVNPayUrl] VNP_TMN_CODE:", tmnCode);
  console.log("[createVNPayUrl] VNP_URL:", vnpUrl);
  console.log("[createVNPayUrl] VNP_RETURN_URL:", returnUrl);

  const createDate = moment().tz("Asia/Ho_Chi_Minh").format("YYYYMMDDHHmmss");
  const expireDate = moment()
    .tz("Asia/Ho_Chi_Minh")
    .add(30, "minutes")
    .format("YYYYMMDDHHmmss");
  const tick = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const forwarded = req.headers["x-forwarded-for"];
  let ipAddr = forwarded
    ? forwarded.split(",")[0].trim()
    : req.connection.remoteAddress || req.socket.remoteAddress || "127.0.0.1";
  if (ipAddr === "::1" || ipAddr === "0:0:0:0:0:0:0:1") {
    ipAddr = "127.0.0.1";
  }

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: amount * 100,
    vnp_CurrCode: "VND",
    vnp_TxnRef: tick,
    vnp_OrderInfo: encodeURIComponent(description).replace(/%20/g, "+"),
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const vnp_ParamsToSign = {};
  Object.keys(vnp_Params)
    .filter((key) => key.startsWith("vnp_") && key !== "vnp_SecureHash")
    .sort()
    .forEach((key) => {
      vnp_ParamsToSign[key] = vnp_Params[key];
    });

  const signData = qs.stringify(vnp_ParamsToSign, { encode: true });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params.vnp_SecureHash = signed;

  const paymentUrl = vnpUrl + "?" + qs.stringify(vnp_Params, { encode: true });

  // Lưu transaction vào DB
  const transaction = await Transaction.create({
    transactionId: tick,
    amount,
    description,
    status: "pending",
    userId: req.user._id
  });
  if (!req.user._id) {
    console.warn("[createVNPayUrl] WARNING: req.user._id is missing!");
  } else {
    console.log(`[createVNPayUrl] Transaction created:`, transaction);
  }

  res.json({ paymentUrl, transactionId: tick });
};

exports.vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = qs.stringify(vnp_Params, { encode: true });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    const txnRef = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    let status = "pending";
    if (responseCode === "00") status = "success";
    else status = "failed";

    // Thêm log chi tiết
    console.log("[vnpayReturn] Callback từ VNPay:", vnp_Params);
    console.log("[vnpayReturn] txnRef:", txnRef, "responseCode:", responseCode, "status:", status);

    // Cập nhật trạng thái transaction
    const updateResult = await Transaction.findOneAndUpdate(
      { transactionId: txnRef },
      { status, updatedAt: new Date() },
      { new: true }
    );
    console.log("[vnpayReturn] Transaction update result:", updateResult);

    if (secureHash === signed) {
      if (responseCode === "00") {
        return res.send("Thanh toán thành công! Bạn đã mở khóa biểu đồ chi tiết.");
      } else if (responseCode === "24") {
        return res.send("Giao dịch đã quá thời gian chờ thanh toán. Quý khách vui lòng thực hiện lại giao dịch.");
      } else {
        return res.send(`Thanh toán thất bại. Mã lỗi: ${responseCode}`);
      }
    } else {
      return res.send("Chữ ký không hợp lệ. Giao dịch không được xác thực.");
    }
  } catch (error) {
    console.error("[vnpayReturn] Lỗi hệ thống VNPay:", error);
    return res.status(500).send("Lỗi hệ thống VNPay.");
  }
};

exports.checkStatus = async (req, res) => {
  const { transactionId } = req.query;
  if (!transactionId) {
    return res.status(400).json({ paid: false, message: "Thiếu transactionId" });
  }
  const transaction = await Transaction.findOne({ transactionId });
  if (!transaction) {
    return res.status(404).json({ paid: false, message: "Không tìm thấy giao dịch" });
  }
  if (transaction.status === "success") {
    return res.json({ paid: true });
  } else {
    return res.json({ paid: false });
  }
};

exports.getHistory = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized: user not found" });
  }
  console.log("[getHistory] req.user._id:", req.user?._id);
  const transactions = await Transaction.find({ userId: mongoose.Types.ObjectId(req.user._id) }).sort({ createdAt: -1 });
  console.log(`[getHistory] Found ${transactions.length} transactions for userId:`, req.user._id);
  res.json({ transactions });
};