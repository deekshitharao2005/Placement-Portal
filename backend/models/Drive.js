const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    package: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
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