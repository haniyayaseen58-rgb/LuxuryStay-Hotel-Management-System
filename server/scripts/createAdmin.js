const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

// Usage: set ADMIN_EMAIL and ADMIN_PASSWORD (and optionally ADMIN_NAME)
// in server/.env or the shell, then run: npm run create-admin
const createAdmin = async () => {
  const adminName = process.env.ADMIN_NAME || "LuxuryStay Admin";
  const adminEmail = String(process.env.ADMIN_EMAIL || "")
    .toLowerCase()
    .trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminEmail || adminPassword.length < 6) {
    console.error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 6 characters) before running this script."
    );
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("MongoDB Connected");

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("An account with this email already exists. No changes made.");
      await mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully!");
    console.log("Email:", adminEmail);

    await mongoose.connection.close();
  } catch (error) {
    console.error("Admin Creation Error:", error.message);
    process.exitCode = 1;
    await mongoose.connection.close();
  }
};

createAdmin();
