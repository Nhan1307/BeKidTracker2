const mongoose = require("mongoose");

const ThoiGianBieuSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Children",
      required: true,
    },
    title: { type: String, required: true },              // Tên hoạt động
    startTime: { type: String, required: true },          // Giờ bắt đầu (ví dụ: "08:30")
    endTime: { type: String, required: true },            // Giờ kết thúc (ví dụ: "09:00")
    repeat: { type: String, enum: ["daily", "weekly"], default: "daily" }, // Chu kỳ lặp lại
    note: { type: String },                               // Ghi chú tùy chọn
  },
  { timestamps: true }
);

const ThoiGianBieu = mongoose.model("ThoiGianBieu", ThoiGianBieuSchema);
module.exports = ThoiGianBieu;
