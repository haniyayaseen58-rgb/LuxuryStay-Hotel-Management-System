const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const adminEmail = "admin@luxurystay.com";
    const adminPassword = "LuxuryStay@2026";

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      await mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      name: "LuxuryStay Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully!");
    console.log("Email:", adminEmail);

    await mongoose.connection.close();
  } catch (error) {
    console.error("Admin Creation Error:", error.message);
    await mongoose.connection.close();
  }
};

createAdmin();