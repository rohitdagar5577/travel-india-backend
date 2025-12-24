const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const authMiddleware = require("../middleware/authMiddleware");

// REPORT USER
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { reportedUser, reason } = req.body;

    if (!reportedUser || !reason) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const report = new Report({
      reportedUser,
      reportedBy: req.userId,
      reason
    });

    await report.save();
    res.status(201).json({ message: "Report submitted ✅" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
