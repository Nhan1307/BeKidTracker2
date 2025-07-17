const express = require("express");
const { completeEvaluation, getEvaluationByChildAndDate, updateEvaluation, getAllEvaluations } = require("../controller/evaluationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/complete", authMiddleware, completeEvaluation);
router.put("/update", authMiddleware, updateEvaluation); 
router.get("/get-evaluation", authMiddleware, getEvaluationByChildAndDate);
router.get("/all", authMiddleware, getAllEvaluations);

module.exports = router;
