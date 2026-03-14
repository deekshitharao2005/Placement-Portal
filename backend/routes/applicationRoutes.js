const express = require("express");
const Application = require("../models/Application");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Student apply to drive
router.post("/apply", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { driveId } = req.body;

    const application = await Application.create({
      student: req.user.id,
      drive: driveId,
      status: "Applied",
    });

    res.status(201).json({
      message: "Applied successfully",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already applied to this drive" });
    }
    res.status(500).json({ message: error.message });
  }
});

// Student get own applications
router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate("drive")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin get all applications
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("student", "name rollNumber branch")
      .populate("drive", "companyName role package")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin update application status
router.put("/:id/status", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("student", "name rollNumber branch")
      .populate("drive", "companyName role package");

    res.json({
      message: "Status updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;