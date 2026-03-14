const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Drive = require("../models/Drive");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Student signup
router.post("/signup", async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ message: "Roll number and password are required" });
    }

    const existingStudent = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
    });

    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      rollNumber: rollNumber.toUpperCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Student account created successfully",
      studentId: student._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student login
router.post("/login", async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    const student = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: "student",
      student: {
        _id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        profileCompleted: student.profileCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student profile
router.get("/me", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete / update profile
router.put("/profile", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { name, branch, cgpa, backlogs, year, skills, workExperience } = req.body;

    const parsedSkills =
      typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : [];

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      {
        name,
        branch,
        cgpa: Number(cgpa),
        backlogs: Number(backlogs),
        year: Number(year),
        skills: parsedSkills,
        workExperience,
        profileCompleted: true,
      },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get eligible drives
router.get("/eligible-drives", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    if (!student.profileCompleted) {
      return res.status(400).json({ message: "Complete profile first" });
    }

    const drives = await Drive.find().sort({ createdAt: -1 });

    const eligibleDrives = drives.filter((drive) => {
      const cgpaOk = student.cgpa >= drive.minCGPA;
      const branchOk =
        drive.allowedBranches.length === 0 ||
        drive.allowedBranches.includes(student.branch);
      const backlogOk = student.backlogs <= drive.maxBacklogs;

      const studentSkillsLower = student.skills.map((s) => s.toLowerCase());
      const requiredSkillsLower = drive.requiredSkills.map((s) => s.toLowerCase());

      // At least one matching skill if required skills exist
      const skillsOk =
        requiredSkillsLower.length === 0 ||
        requiredSkillsLower.some((skill) => studentSkillsLower.includes(skill));

      return cgpaOk && branchOk && backlogOk && skillsOk;
    });

    res.json(eligibleDrives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;