const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
    branch: {
      type: String,
      default: "",
    },
    cgpa: {
      type: Number,
      default: 0,
    },
    backlogs: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      default: 1,
    },
    skills: {
      type: [String],
      default: [],
    },
    workExperience: {
      type: String,
      default: "",
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);