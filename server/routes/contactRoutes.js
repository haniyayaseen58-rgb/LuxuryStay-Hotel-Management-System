const express = require("express");
const Contact = require("../models/Contact");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      enquiryType,
      message,
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !enquiryType ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, enquiry type and message are required.",
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || "",
      enquiryType,
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message:
        "Your enquiry has been sent successfully.",
      enquiry: contact,
    });
  } catch (error) {
    console.error(
      "Contact Enquiry Error:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          "Please provide valid enquiry details.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to send your enquiry.",
    });
  }
});

module.exports = router;