const express = require("express");
const {
  addThoiGianBieu,
  getThoiGianBieu,
  getThoiGianBieuById,
  deleteThoiGianBieu
} = require("../controller/thoiGianBieuController");
const authMiddleware = require("../middlewares/errorMiddleWare");

const router = express.Router();

router.post("/", authMiddleware, addThoiGianBieu);
router.get("/", authMiddleware, getThoiGianBieu);
router.get("/:id", authMiddleware, getThoiGianBieuById);
router.delete("/:id", authMiddleware, deleteThoiGianBieu);


module.exports = router;
