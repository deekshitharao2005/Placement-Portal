const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Drive = require("../models/Drive");
const Application = require("../models/Application");
const sendMail = require("../utils/sendMail");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Student signup with OTP
router.post("/signup", async (req, res) => {
  try {
    const { rollNumber, password, email } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({
        message: "Roll number and password are required",
      });
    }

    const normalizedRollNumber = rollNumber.trim().toUpperCase();
    const normalizedEmail = email ? email.trim().toLowerCase() : "";

    const existingConditions = [{ rollNumber: normalizedRollNumber }];
    if (normalizedEmail) {
      existingConditions.push({ email: normalizedEmail });
    }

    const existingStudent = await Student.findOne({
      $or: existingConditions,
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student already exists with this roll number or email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const studentData = {
      rollNumber: normalizedRollNumber,
      password: hashedPassword,
      email: normalizedEmail,
      emailVerified: normalizedEmail ? false : true,
      otpCode: null,
      otpExpires: null,
    };

    if (normalizedEmail) {
      const otpCode = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      studentData.otpCode = otpCode;
      studentData.otpExpires = otpExpires;
    }

    const student = await Student.create(studentData);

    if (normalizedEmail) {
      await sendMail(
        student.email,
        "Verify your email - Placement Portal",
        `Your OTP is ${student.otpCode}. It is valid for 10 minutes.`,
        `
          <div style="font-family: Arial, sans-serif;">
            <h2>Placement Portal Email Verification</h2>
            <p>Your OTP is:</p>
            <h1 style="letter-spacing: 3px;">${student.otpCode}</h1>
            <p>This OTP is valid for 10 minutes.</p>
          </div>
        `
      );

      return res.status(201).json({
        message: "Signup successful. OTP sent to your email.",
        rollNumber: student.rollNumber,
        emailRequiredForVerification: true,
      });
    }

    return res.status(201).json({
      message: "Signup successful. You can log in now.",
      rollNumber: student.rollNumber,
      emailRequiredForVerification: false,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: error.message || "Signup failed",
    });
  }
});

// Verify OTP
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { rollNumber, otp } = req.body;

    if (!rollNumber || !otp) {
      return res.status(400).json({
        message: "Roll number and OTP are required",
      });
    }

    const student = await Student.findOne({
      rollNumber: rollNumber.trim().toUpperCase(),
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.otpCode || !student.otpExpires) {
      return res.status(400).json({ message: "No OTP found. Please resend OTP." });
    }

    if (student.otpCode !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (student.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    student.emailVerified = true;
    student.otpCode = null;
    student.otpExpires = null;
    await student.save();

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      message: error.message || "OTP verification failed",
    });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { rollNumber } = req.body;

    if (!rollNumber) {
      return res.status(400).json({ message: "Roll number is required" });
    }

    const student = await Student.findOne({
      rollNumber: rollNumber.trim().toUpperCase(),
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.email) {
      return res.status(400).json({
        message: "No email found for this student. Add email first.",
      });
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    student.otpCode = otpCode;
    student.otpExpires = otpExpires;
    student.emailVerified = false;
    await student.save();

    await sendMail(
      student.email,
      "Your new OTP - Placement Portal",
      `Your new OTP is ${otpCode}. It is valid for 10 minutes.`,
      `
        <div style="font-family: Arial, sans-serif;">
          <h2>Placement Portal OTP Resend</h2>
          <p>Your new OTP is:</p>
          <h1 style="letter-spacing: 3px;">${otpCode}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `
    );

    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      message: error.message || "Failed to resend OTP",
    });
  }
});
// Student login
router.post("/login", async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({
        message: "Roll number and password are required",
      });
    }

    const student = await Student.findOne({
      rollNumber: rollNumber.trim().toUpperCase(),
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (student.email && !student.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        rollNumber: student.rollNumber,
      });
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
        email: student.email,
        branch: student.branch,
        profileCompleted: student.profileCompleted,
        placementStatus: student.placementStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: error.message || "Login failed",
    });
  }
});
// Get current student
router.get("/me", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select(
      "-password -otpCode -otpExpires"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

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
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : [];

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      {
        name,
        branch,
        cgpa: Number(cgpa) || 0,
        backlogs: Number(backlogs) || 0,
        year: Number(year) || 0,
        skills: parsedSkills,
        workExperience,
        profileCompleted: true,
      },
      { new: true }
    ).select("-password -otpCode -otpExpires");

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

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.profileCompleted) {
      return res.status(400).json({ message: "Complete profile first" });
    }

    const [drives, applications] = await Promise.all([
      Drive.find().sort({ createdAt: -1 }),
      Application.find({ student: req.user.id }).select("drive"),
    ]);

    const appliedDriveIds = new Set(applications.map((app) => String(app.drive)));
    const studentBranch = (student.branch || "").trim().toLowerCase();
    const studentSkills = (student.skills || []).map((s) =>
      String(s).trim().toLowerCase()
    );

    const eligibleDrives = drives
      .filter((drive) => {
        const cgpaOk = Number(student.cgpa || 0) >= Number(drive.minCGPA || 0);
        const backlogOk = Number(student.backlogs || 0) <= Number(drive.maxBacklogs ?? 99);

        const allowedBranches = Array.isArray(drive.allowedBranches)
          ? drive.allowedBranches.map((b) => String(b).trim().toLowerCase()).filter(Boolean)
          : [];

        const branchOk =
          allowedBranches.length === 0 || allowedBranches.includes(studentBranch);

        const requiredSkills = Array.isArray(drive.requiredSkills)
          ? drive.requiredSkills.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
          : [];

        const skillsOk =
          requiredSkills.length === 0 ||
          requiredSkills.some((skill) => studentSkills.includes(skill));

        return cgpaOk && backlogOk && branchOk && skillsOk;
      })
      .map((drive) => ({
        ...drive.toObject(),
        hasApplied: appliedDriveIds.has(String(drive._id)),
      }));

    res.json(eligibleDrives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;