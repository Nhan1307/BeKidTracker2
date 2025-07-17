// controllers/scheduleController.js
const Schedule = require("../models/scheduleModel");
const Child = require("../models/childrenModel");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const addSchedule = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      dayOfWeek,
      subjectName,
      teacherName,
      lessonPeriod,
      isExam,
      isWeekly,
      childId,
    } = req.body;

    const userId = req.user._id;

    if (
      !dateFrom ||
      !dateTo ||
      !dayOfWeek ||
      !subjectName ||
      !teacherName ||
      !lessonPeriod ||
      !childId
    ) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin thời gian biểu!" });
    }
    // 👉 Chuyển đổi định dạng "dd/MM/yyyy" thành Date object
    const parsedDateFrom = dayjs(dateFrom, "DD/MM/YYYY").toDate();
    const parsedDateTo = dayjs(dateTo, "DD/MM/YYYY").toDate();

    const schedule = new Schedule({
      dateFrom: parsedDateFrom,
      dateTo: parsedDateTo,
      dayOfWeek,
      subjectName,
      teacherName,
      lessonPeriod,
      isExam: isExam || false,
      isWeekly: isWeekly !== undefined ? isWeekly : true,
      user: userId,
      child: childId,
    });

    console.log("Thêm thời gian biểu:", schedule);

    await schedule.save();

    res
      .status(201)
      .json({ message: "Tạo thời gian biểu thành công!", schedule });
  } catch (error) {
    console.error("Lỗi tạo thời gian biểu:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getSchedulesByChild = async (req, res) => {
  try {
    const userId = req.user._id;
    const childId = req.params.childId;

    const schedules = await Schedule.find({
      user: userId,
      child: childId,
    }).sort({ dateFrom: 1 });

    res.status(200).json({ data: schedules });
  } catch (error) {
    console.error("Lỗi lấy thời gian biểu:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: "Không tìm thấy thời gian biểu" });
    }

    res.status(200).json(schedule);
  } catch (error) {
    console.error("Lỗi lấy chi tiết thời gian biểu:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const updates = req.body;

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: "Không tìm thấy thời gian biểu" });
    }

    Object.assign(schedule, updates);
    await schedule.save();

    res.status(200).json({ message: "Cập nhật thành công", schedule });
  } catch (error) {
    console.error("Lỗi cập nhật thời gian biểu:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Không tìm thấy thời gian biểu" });
    }

    await Schedule.deleteOne({ _id: scheduleId });

    res.status(200).json({ message: "Xóa thời gian biểu thành công" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  addSchedule,
  getSchedulesByChild,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
