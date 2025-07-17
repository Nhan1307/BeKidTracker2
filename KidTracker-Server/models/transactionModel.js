const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true }, // vnp_TxnRef
  amount: Number,
  description: String,
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // <-- thêm dòng này
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema); 