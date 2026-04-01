const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    package: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    applicationLink: {
      type: String,
      default: "",
      trim: true,
    },
    minCGPA: {
      type: Number,
      default: 0,
    },
    allowedBranches: {
      type: [String],
      default: [],
    },
    maxBacklogs: {
      type: Number,
      default: 99,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Drive", driveSchema);