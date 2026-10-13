
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

const User = require("../models/User");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

const createOtpTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

const hashValue = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    if (typeof name !== "string" || !/[A-Za-z]/.test(name)) {
      return res.status(400).json({
        success: false,
        message:
          "Username must contain at least one letter. Numbers only are not allowed.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "guest",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

router.post(
  "/create-staff",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all fields.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters.",
        });
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const staff = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "staff",
      });

      return res.status(201).json({
        success: true,
        message: "Staff account created successfully!",
        user: {
          id: staff._id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
        },
      });
    } catch (error) {
      console.error("Create Staff Error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
      });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

router.get("/me", protect, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

router.put(
  "/me",
  protect,
  authorizeRoles("guest"),
  async (req, res) => {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: "Name and email are required.",
        });
      }

      if (typeof name !== "string" || !/[A-Za-z]/.test(name)) {
        return res.status(400).json({
          success: false,
          message:
            "Name must contain at least one letter. Numbers only are not allowed.",
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      user.name = name.trim();
      user.email = normalizedEmail;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully!",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Update Guest Profile Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update profile.",
      });
    }
  }
);

router.get(
  "/admin-test",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Welcome Admin! You have admin access.",
      user: req.user,
    });
  }
);

router.post("/forgot-password", otpLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .toLowerCase()
      .trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address.",
      });
    }

    const responseMessage =
      "If this email is registered, a verification code will be sent.";

    const user = await User.findOne({ email }).select(
      "+resetOtpHash +resetOtpExpires +resetOtpVerified"
    );

    if (!user) {
      return res.json({
        success: true,
        message: responseMessage,
      });
    }

    if (
      user.resetOtpExpires &&
      user.resetOtpHash &&
      !user.resetOtpVerified &&
      user.resetOtpExpires.getTime() - Date.now() >
        4 * 60 * 1000
    ) {
      return res.json({
        success: true,
        message: responseMessage,
      });
    }

    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_APP_PASSWORD
    ) {
      return res.status(503).json({
        success: false,
        message: "Email service is not configured.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.resetOtpHash = hashValue(otp);
    user.resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.resetOtpVerified = false;

    await user.save();

    try {
      const transporter = createOtpTransporter();

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "LuxuryStay - Password Reset Verification",
        text: `Your password reset code is ${otp}. This code expires in 5 minutes. If you did not request this, ignore this email.`,
      });
    } catch (mailError) {
      user.resetOtpHash = null;
      user.resetOtpExpires = null;
      user.resetOtpVerified = false;

      await user.save();

      console.error("OTP Email Error:", {
        code: mailError.code,
        command: mailError.command,
        responseCode: mailError.responseCode,
        response: mailError.response,
        message: mailError.message,
      });

      return res.status(503).json({
        success: false,
        message: "Unable to send OTP email. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset.",
    });
  }
});

router.post("/verify-otp", otpLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .toLowerCase()
      .trim();

    const otp = String(req.body.otp || "").trim();

    if (!email || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit OTP.",
      });
    }

    const user = await User.findOne({ email }).select(
      "+resetOtpHash +resetOtpExpires +resetOtpVerified"
    );

    if (
      !user ||
      !user.resetOtpHash ||
      !user.resetOtpExpires ||
      user.resetOtpVerified ||
      user.resetOtpExpires.getTime() <= Date.now() ||
      user.resetOtpHash !== hashValue(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetOtpHash = hashValue(resetToken);
    user.resetOtpVerified = true;
    user.resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    return res.json({
      success: true,
      message: "OTP verified successfully.",
      resetToken,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP.",
    });
  }
});

router.post("/reset-password", otpLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .toLowerCase()
      .trim();

    const resetToken = String(req.body.resetToken || "");
    const { newPassword, confirmPassword } = req.body;

    if (
      !email ||
      !resetToken ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const user = await User.findOne({ email }).select(
      "+resetOtpHash +resetOtpExpires +resetOtpVerified"
    );

    if (
      !user ||
      !user.resetOtpVerified ||
      !user.resetOtpHash ||
      !user.resetOtpExpires ||
      user.resetOtpExpires.getTime() <= Date.now() ||
      user.resetOtpHash !== hashValue(resetToken)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset session.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetOtpVerified = false;

    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully. Please sign in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
});

module.exports = router;
