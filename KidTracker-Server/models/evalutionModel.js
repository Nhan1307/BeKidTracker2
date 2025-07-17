const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Children",
    required: true,
  },
  date: {
    type: String, // Store date as "YYYY-MM-DD"
    required: true,
  },
  evaluations: [
    {
      activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ThoiGianBieu",
        required: true,
      },
      status: {
        type: String,
        enum: ["completed", "missed", "pending"],
        default: "pending",
      },
    },
  ],
});

module.exports = mongoose.model("Evaluation", evaluationSchema);