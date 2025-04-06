const Evaluation = require("../models/evalutionModel");
const ThoiGianBieu = require("../models/thoiGianBieu");

const completeEvaluation = async (req, res) => {
  try {
    const { childId, date, evaluations } = req.body;

    if (!childId || !date || !evaluations || !Array.isArray(evaluations)) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào!" });
    }

    // Validate each activity
    for (const evaluation of evaluations) {
      const activity = await ThoiGianBieu.findById(evaluation.activityId);
      if (!activity) {
        return res
          .status(404)
          .json({ message: `Không tìm thấy hoạt động với ID: ${evaluation.activityId}` });
      }
    }

    // Save evaluations to the database
    const newEvaluation = new Evaluation({
      child: childId,
      date,
      evaluations,
    });

    console.log("Đánh giá:", newEvaluation);
    
    await newEvaluation.save();

    res.status(201).json({ message: "Hoàn tất đánh giá thành công!", data: newEvaluation });
  } catch (error) {
    console.error("Lỗi khi hoàn tất đánh giá:", error.message);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
  }
};

const getEvaluationByChildAndDate = async (req, res) => {
  try {
    const { childId, date } = req.query;
    console.log("thông tin nhận:", req.query);
    
    if (!childId || !date) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào!" });
    }

    const evaluation = await Evaluation.findOne({ child: childId, date });

    if (!evaluation) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá!" });
    }
    console.log("Đánh giá:", evaluation);
    
    res.status(200).json({ message: "Lấy đánh giá thành công!", data: evaluation });
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error.message);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
  }
};

const updateEvaluation = async (req, res) => {
  try {
    const { childId, date, evaluations } = req.body;

    if (!childId || !date || !evaluations || !Array.isArray(evaluations)) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào!" });
    }

    // Validate từng hoạt động trong đánh giá
    for (const evaluation of evaluations) {
      const activity = await ThoiGianBieu.findById(evaluation.activityId);
      if (!activity) {
        return res.status(404).json({
          message: `Không tìm thấy hoạt động với ID: ${evaluation.activityId}`,
        });
      }
    }

    // Cập nhật đánh giá trong cơ sở dữ liệu
    const updatedEvaluation = await Evaluation.findOneAndUpdate(
      { child: childId, date },
      { evaluations },
      { new: true }
    );

    if (!updatedEvaluation) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá để cập nhật!" });
    }

    res
      .status(200)
      .json({ message: "Cập nhật đánh giá thành công!", data: updatedEvaluation });
  } catch (error) {
    console.error("Lỗi khi cập nhật đánh giá:", error.message);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
  }
};

module.exports = {
  completeEvaluation,
  getEvaluationByChildAndDate,
  updateEvaluation,
};


