// models/scheduleModel.js
const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  dateFrom: {
    type: Date,
    required: true,
  },
  dateTo: {
    type: Date,
    required: true,
  },
  dayOfWeek: {
    type: [String],
    required: true,
    enum: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
  },
  subjectName: {
    type: String,
    required: true,
  },
  teacherName: {
    type: String,
    required: true,
  },
  lessonPeriod: {
    type: String,
    required: true,
    
  },
  isExam: {
    type: Boolean,
    default: false,
  },
  isWeekly: {
    type: Boolean,
    default: true,
  },
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Schedule", scheduleSchema);
