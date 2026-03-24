const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Application = require("../models/Application");
const Student = require("../models/Student");
const Drive = require("../models/Drive");
const sendMail = require("../utils/sendMail");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

const resumesDir = path.join(__dirname, "..", "uploads", "resumes");

if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumesDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === "application/pdf" ||
    path.extname(file.originalname).toLowerCase() === ".pdf";

  if (!isPdf) {
    return cb(new Error("Only PDF resumes are allowed"));
  }

  cb(null, true);
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Student applies to a drive with optional resume
router.post(
  "/",
  verifyToken,
  requireRole("student"),
  uploadResume.single("resume"),
  async (req, res) => {
    try {
      const { driveId } = req.body;

      if (!driveId) {
        return res.status(400).json({ message: "Drive ID is required" });
      }

      const existing = await Application.findOne({
        student: req.user.id,
        drive: driveId,
      });

      if (existing) {
        return res.status(400).json({ message: "Already applied to this drive" });
      }

      const drive = await Drive.findById(driveId);
      if (!drive) {
        return res.status(404).json({ message: "Drive not found" });
      }

      const application = await Application.create({
        student: req.user.id,
        drive: driveId,
        status: "Applied",
        resumeUrl: req.file ? `/uploads/resumes/${req.file.filename}` : "",
        resumeOriginalName: req.file ? req.file.originalname : "",
      });

      res.status(201).json({
        message: req.file
          ? "Applied successfully with resume uploaded"
          : "Applied successfully",
        application,
      });
    } catch (error) {
      console.error("Apply error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Student sees own applications
router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate("drive", "companyName role package requiredSkills description")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Fetch my applications error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin sees applicants for a drive
router.get("/drive/:driveId", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const applications = await Application.find({ drive: req.params.driveId })
      .populate("student", "name rollNumber email branch cgpa skills placementStatus")
      .populate("drive", "companyName role package")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Fetch applicants error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin updates application status
router.put("/:id/status", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Applied", "Shortlisted", "Selected", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.id)
      .populate("student")
      .populate("drive");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    if (status === "Selected") {
      await Student.findByIdAndUpdate(application.student._id, {
        placementStatus: "Placed",
      });
    } else {
      await Student.findByIdAndUpdate(application.student._id, {
        placementStatus: "Not Placed",
      });
    }

    if (application.student.email) {
      await sendMail(
        application.student.email,
        `Application Status Updated - ${application.drive.companyName}`,
        `Your application for ${application.drive.companyName} - ${application.drive.role} is now ${status}.`,
        `
          <p>Hello ${application.student.name || application.student.rollNumber},</p>
          <p>Your application for <b>${application.drive.companyName}</b> - <b>${application.drive.role}</b> has been updated.</p>
          <p><b>New Status:</b> ${status}</p>
          <p>Regards,<br/>Placement Portal</p>
        `
      );
    }

    res.json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  if (err && err.message === "Only PDF resumes are allowed") {
    return res.status(400).json({ message: err.message });
  }

  next(err);
});

module.exports = router;