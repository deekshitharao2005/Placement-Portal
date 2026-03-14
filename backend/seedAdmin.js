const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const existing = await Admin.findOne({ adminId: "admin01" });

    if (existing) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await Admin.create({
      adminId: "admin01",
      password: hashedPassword,
      name: "Placement Officer",
    });

    console.log("Admin created successfully");
    console.log("Admin ID: admin01");
    console.log("Password: admin123");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();