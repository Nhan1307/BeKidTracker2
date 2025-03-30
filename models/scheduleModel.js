const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema(
  {    
    semester: {
      type: String,
      required: true,
      enum: ["Học kỳ 1", "Học kỳ 2", "Học kỳ hè"],
    },
    academicYear: { type: String, required: true }, //"2024-2025"
    activities: [
      {
        dayOfWeek: {
          type: String,
          required: true,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        period: { type: Number, required: true }, // Số tiết học (1-10)
        subject: String, // Môn học
        description: String, // Nội dung chi tiết
      },
    ],
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", ScheduleSchema);
module.exports = Schedule;
