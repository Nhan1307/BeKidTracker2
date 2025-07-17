const mongoose = require("mongoose");

const ChildSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    level: {
      type: String,
      enum: ["Cấp 1", "Cấp 2", "Cấp 3", "Đại học/Cao Đẳng"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Children", ChildSchema);
