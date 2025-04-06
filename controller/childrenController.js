const Child = require("../models/childrenModel");
const UserModel = require("../models/userModel");

// Thêm trẻ mới
const addChild = async (req, res) => {
  try {
    console.log("Dữ liệu nhận từ client:", req.body);

    const { name, dateOfBirth, gender, level } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập" });
    }

    if (!name || !dateOfBirth || !gender || !level) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào!" });
    }

    const parsedDate = new Date(dateOfBirth);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Ngày sinh không hợp lệ!" });
    }

    const newChild = new Child({
      name,
      dateOfBirth: parsedDate,
      gender,
      level,
    });

    await newChild.save();

    // Gắn trẻ vào user hiện tại
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.child.push(newChild._id);
    await user.save();

    console.log("Thêm trẻ thành công:", newChild);
    res.status(201).json({ message: "Thêm trẻ thành công!", newChild });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
  }
};

// Lấy danh sách trẻ của user hiện tại
const getChildren = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập" });
    }

    const user = await UserModel.findById(req.user._id).populate("child");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ data: user.child });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách trẻ:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Lấy thông tin 1 trẻ theo ID
const getChildById = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({ message: "Không tìm thấy trẻ" });
    }

    res.status(200).json(child);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin trẻ:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Cập nhật thông tin trẻ
const updateChild = async (req, res) => {
  try {
    const { name, dateOfBirth, gender, level } = req.body;
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({ message: "Không tìm thấy trẻ" });
    }

    if (name) child.name = name;
    if (dateOfBirth) {
      const parsedDate = new Date(dateOfBirth);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Ngày sinh không hợp lệ!" });
      }
      child.dateOfBirth = parsedDate;
    }
    if (gender) child.gender = gender;
    if (level) child.level = level;

    await child.save();

    res.status(200).json({ message: "Cập nhật thành công", child });
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Xóa trẻ
const deleteChild = async (req, res) => {
  try {
    const userId = req.user._id;
    const childId = req.params.id;

    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ message: "Không tìm thấy trẻ" });
    }

    const user = await UserModel.findById(userId);
    if (!user || !user.child.includes(childId)) {
      return res.status(403).json({ message: "Bạn không có quyền xóa trẻ này" });
    }

    // Xóa khỏi danh sách user
    user.child = user.child.filter((id) => id.toString() !== childId);
    await user.save();

    // Xóa trẻ khỏi DB
    await child.deleteOne();

    res.status(200).json({ message: "Xóa hồ sơ trẻ thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa trẻ:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

module.exports = {
  addChild,
  getChildren,
  getChildById,
  updateChild,
  deleteChild,
};
