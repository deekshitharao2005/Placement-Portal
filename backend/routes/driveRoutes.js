const express = require("express");
const Drive = require("../models/Drive");
const Student = require("../models/Student");
const Application = require("../models/Application");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Create drive
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const {
      title,
      companyName,
      image,
      date,
      role,
      package,
      description,
      applicationLink,
      minCGPA,
      allowedBranches,
      maxBacklogs,
      requiredSkills,
    } = req.body;

    const drive = await Drive.create({
      title,
      companyName,
      image,
      date,
      role,
      package,
      description,
      applicationLink,
      minCGPA: Number(minCGPA || 0),
      allowedBranches: Array.isArray(allowedBranches)
        ? allowedBranches
        : (allowedBranches || "")
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean),
      maxBacklogs: Number(maxBacklogs || 99),
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : (requiredSkills || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
    });

    res.status(201).json({
      message: "Drive created successfully",
      drive,
    });
  } catch (error) {
    console.error("Create drive error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all drives
router.get("/", verifyToken, async (req, res) => {
  try {
    const drives = await Drive.find().sort({ createdAt: -1 });

    if (req.user.role === "admin") {
      return res.json(drives);
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const applications = await Application.find({ student: req.user.id }).select(
      "drive status"
    );

    const applicationMap = new Map(
      applications.map((app) => [String(app.drive), app.status])
    );

    const enrichedDrives = drives.map((drive) => {
      let isEligible = true;

      if (drive.minCGPA && student.cgpa < drive.minCGPA) {
        isEligible = false;
      }

      if (
        drive.maxBacklogs !== undefined &&
        student.backlogs > drive.maxBacklogs
      ) {
        isEligible = false;
      }

      if (
        drive.allowedBranches &&
        drive.allowedBranches.length > 0 &&
        !drive.allowedBranches.includes(student.branch)
      ) {
        isEligible = false;
      }

      const applicationStatus = applicationMap.get(String(drive._id)) || null;

      return {
        ...drive.toObject(),
        isEligible,
        alreadyApplied: !!applicationStatus,
        applicationStatus,
      };
    });

    res.json(enrichedDrives);
  } catch (error) {
    console.error("Fetch drives error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete drive
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await Drive.findByIdAndDelete(req.params.id);
    res.json({ message: "Drive deleted successfully" });
  } catch (error) {
    console.error("Delete drive error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;