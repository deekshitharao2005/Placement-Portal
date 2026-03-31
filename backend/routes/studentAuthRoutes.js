const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

const isValidRoll = (roll) => {
  if (!roll) return false;
  const upper = roll.toUpperCase();
  const regex = /^23071A72\d{2}$/;
  if (!regex.test(upper)) return false;
  const last2 = parseInt(upper.slice(-2), 10);
  return last2 >= 1 && last2 <= 64;
};

// signup
router.post("/signup", async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!isValidRoll(rollNumber)) {
      return res.status(400).json({
        message: "Only roll numbers from 23071A7201 to 23071A7264 allowed",
      });
    }

    if (!rollNumber || !password) {
      return res.status(400).json({
        message: "Roll number and password are required",
      });
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
      profileCompleted: false,
    });

    res.status(201).json({
      message: "Signup successful",
      student: {
        _id: student._id,
        rollNumber: student.rollNumber,
        profileCompleted: student.profileCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!isValidRoll(rollNumber)) {
      return res.status(400).json({ message: "Invalid roll number" });
    }

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
        branch: student.branch,
        profileCompleted: student.profileCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// profile update
router.put("/profile", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { name, branch, cgpa, backlogs, year, skills, workExperience } = req.body;

    const parsedSkills =
      typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(skills)
        ? skills
        : [];

    const updatedStudent = await Student.findByIdAndUpdate(
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

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// me
router.get("/me", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;