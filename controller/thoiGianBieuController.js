const ThoiGianBieu = require("../models/thoiGianBieu");

const addThoiGianBieu = async (req, res) => {
  try {
    const { title, icon, duration, start } = req.body;

    const newThoiGianBieu = new ThoiGianBieu({
      title,
      icon,
      duration,
      start,
    });

    await newThoiGianBieu.save();
    console.log("Thêm thời gian biểu thành công");
    res.status(201).json({ message: "Thêm thời gian biểu thành công", newThoiGianBieu });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

const getThoiGianBieu = async (req, res) => {
  console.log("getThoiGianBieu");
  
  try {
    const thoiGianBieu = await ThoiGianBieu.find();
    res.status(200).json({
      status: 200,
      data: thoiGianBieu
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error });
  }
}

const getThoiGianBieuById = async (req, res) => {
  try {
    const { id } = req.params;
    const thoiGianBieu = await ThoiGianBieu.findById(id);
    res.status(200).json(thoiGianBieu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error });
  }
}

const deleteThoiGianBieu = async (req, res) => {
  try {
    const { id } = req.params;
    await ThoiGianBieu.findByIdAndDelete(id);
    res.status(200).json({ message: "Xóa thời gian biểu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error });
  }
}


module.exports = {
  addThoiGianBieu,
  getThoiGianBieu,
  getThoiGianBieuById,
  deleteThoiGianBieu,

};
