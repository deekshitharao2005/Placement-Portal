const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// 🔥 DB
const connectDB = require("./config/db");
connectDB();

// 🔥 ROUTES IMPORT
const reportRoutes = require("./routes/reportRoutes");

// 🔥 CREATE APP (VERY IMPORTANT ORDER)
const app = express();

// 🔥 MIDDLEWARE
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());

// 🔥 ROUTES (AFTER app is created)
app.use("/api/report", reportRoutes);

app.use("/api/student", require("./routes/studentAuthRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/drives", require("./routes/driveRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/admin-management", require("./routes/adminManagementRoutes"));

// 🔥 ROOT
app.get("/", (req, res) => {
  res.send("Placement Portal API is running");
});

// 🔥 UPLOAD FOLDER SETUP
const uploadsDir = path.join(__dirname, "uploads", "resumes");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔥 SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));