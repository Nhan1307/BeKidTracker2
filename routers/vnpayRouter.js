const express = require("express");
const { createVNPayUrl,vnpayReturn } = require("../controller/vnpayController");
const router = express.Router();

router.post("/create-payment-url", createVNPayUrl);
router.get("/vnpay_return", vnpayReturn);


module.exports = router;