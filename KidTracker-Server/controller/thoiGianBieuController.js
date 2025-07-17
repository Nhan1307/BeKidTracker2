const ThoiGianBieu = require("../models/thoiGianBieu");
 const User = require("../models/userModel");
 const dayjs = require("dayjs");

// Thêm thời gian biểu mới cho 1 trẻ
const createThoiGianBieu = async (req, res) => {
  const userId = req.user._id;
  const { title, startTime, endTime, repeat, note ,dateFrom} = req.body;
  const { childId } = req.params; // Lấy childId từ params
  console.log(req.body);
  console.log("childId", childId);
  if (!childId || !title || !startTime || !endTime || !dateFrom) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
  }

  const user = await User.findById(userId);
  if (!user || !user.child.includes(childId)) {
    return res
      .status(403)
      .json({ message: "Không có quyền thêm thời gian biểu cho trẻ này!" });
  }

   // 👉 Chuyển đổi định dạng "dd/MM/yyyy" thành Date object
      const parsedDateFrom = dayjs(dateFrom, "DD/MM/YYYY").toDate();

  const schedule = await ThoiGianBieu.create({
    user: userId,
    child: childId,
    dateFrom: parsedDateFrom,
    title,
    startTime,
    endTime,
    repeat,
    note,
  });

  res.status(201).json({
    message: "Tạo thời gian biểu thành công!",
    data: schedule,
  });
};

// Lấy toàn bộ thời gian biểu của 1 trẻ
const getThoiGianBieuByChild = async (req, res) => {
  const userId = req.user._id;
  const { childId } = req.params; // Lấy childId từ params

  if (!childId) {
    return res.status(400).json({ message: "Child ID is required!" });
  }
  try {
    const user = await User.findById(userId);
    if (!user || !Array.isArray(user.child)) {
      return res.status(403).json({
        message: "User does not have access to this child's schedule!",
      });
    }

    const hasAccess = user.child.some(
      (id) => id.toString() === childId.toString()
    );
    if (!hasAccess) {
      return res.status(403).json({
        message: "You do not have permission to access this child's schedule!",
      });
    }

    const schedules = await ThoiGianBieu.find({
      user: userId,
      child: childId,
    }).sort({
      startTime: 1,
    });
    res.status(200).json({
      message: "Successfully retrieved the schedule!",
      data: schedules,
    });
  } catch (error) {
    console.error("Error retrieving schedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cập nhật thời gian biểu
const updateThoiGianBieu = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { title, startTime, endTime, repeat, note } = req.body;
  const { childId } = req.params; // Lấy childId từ params

  const schedule = await ThoiGianBieu.findById(id);
  if (!schedule) {
    return res.status(404).json({ message: "Không tìm thấy thời gian biểu" });
  }

  if (schedule.user.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền sửa thời gian biểu này!" });
  }
  schedule.title = title || schedule.title;
  schedule.startTime = startTime || schedule.startTime;
  schedule.endTime = endTime || schedule.endTime;
  schedule.repeat = repeat || schedule.repeat;
  schedule.note = note || schedule.note;

  await schedule.save();

  res.status(200).json({
    message: "Cập nhật thời gian biểu thành công!",
    data: schedule,
  });
};


// Xóa thời gian biểu
const deleteThoiGianBieu = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const schedule = await ThoiGianBieu.findById(id);
  if (!schedule) {
    return res.status(404).json({ message: "Không tìm thấy thời gian biểu" });
  }

  if (schedule.user.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền xóa thời gian biểu này!" });
  }
  await schedule.deleteOne();
 
  res.status(200).json({ message: "Xóa thời gian biểu thành công!" });
};

module.exports = {
  createThoiGianBieu,
   getThoiGianBieuByChild,
   updateThoiGianBieu,
   deleteThoiGianBieu,
};