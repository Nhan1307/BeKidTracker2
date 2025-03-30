const mongoose = require("mongoose");

const ThoiGianBieuSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    start: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ThoiGianBieuModel = mongoose.model("ThoiGianBieu", ThoiGianBieuSchema);
module.exports = ThoiGianBieuModel;
