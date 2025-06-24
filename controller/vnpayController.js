const qs = require("qs");
const crypto = require("crypto");
const moment = require("moment-timezone");

exports.createVNPayUrl = (req, res) => {
  const { amount, description } = req.body;
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

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
    vnp_ReturnUrl:returnUrl,
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
  console.log("signData:", signData);

  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  console.log("Signed:", signed);

  vnp_Params.vnp_SecureHash = signed;

  const paymentUrl = vnpUrl + "?" + qs.stringify(vnp_Params, { encode: true });
  console.log("Payment URL:", paymentUrl);
  res.json({ paymentUrl });
};

exports.vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = qs.stringify(vnp_Params, { encode: true });
    console.log("Received vnp_Params:", vnp_Params);
    console.log("Received signData:", signData);

    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    console.log("Calculated signed:", signed);

    if (secureHash === signed) {
      if (vnp_Params["vnp_ResponseCode"] === "00") {
        return res.send("Thanh toán thành công! Bạn đã mở khóa biểu đồ chi tiết.");
      } else if (vnp_Params["vnp_ResponseCode"] === "24") {
        return res.send("Giao dịch đã quá thời gian chờ thanh toán. Quý khách vui lòng thực hiện lại giao dịch.");
      } else {
        console.error("VNPay callback error:", {
          vnp_Params,
          secureHash,
          signed,
          responseCode: vnp_Params["vnp_ResponseCode"],
        });
        return res.send(`Thanh toán thất bại. Mã lỗi: ${vnp_Params["vnp_ResponseCode"]}`);
      }
    } else {
      console.error("Invalid signature:", { secureHash, signed });
      return res.send("Chữ ký không hợp lệ. Giao dịch không được xác thực.");
    }
  } catch (error) {
    console.error("VNPay callback exception:", error);
    return res.status(500).send("Lỗi hệ thống VNPay.");
  }
};