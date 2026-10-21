import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Clock3,
  Send,
  Sparkles,
} from "lucide-react";

import API_BASE_URL from "../config/api";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    enquiryType: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setStatusMessage("");
    setStatusType("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.enquiryType ||
      !formData.message.trim()
    ) {
      setStatusType("error");
      setStatusMessage(
        "Please complete all required fields."
      );
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage("");
      setStatusType("");

      const response = await fetch(
        `${API_BASE_URL}/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send your enquiry."
        );
      }

      setStatusType("success");
      setStatusMessage(
        data.message ||
          "Your enquiry has been sent successfully."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        enquiryType: "",
        message: "",
      });
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error.message ||
          "Unable to send your enquiry. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <motion.div
          className="contact-left"
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="contact-eyebrow">
            <Sparkles size={14} />
            <span>LET'S TALK</span>
          </div>

          <h2>
            Your stay begins
            <span> with a conversation.</span>
          </h2>

          <p className="contact-description">
            Planning a stay, celebrating something special or simply have a
            question? Our team is here to make every detail feel effortless.
          </p>

          <div className="contact-details">
            <a
              href="mailto:stay@luxurystay.com"
              className="contact-item"
            >
              <div className="contact-icon">
                <Mail size={18} />
              </div>

              <div>
                <span>EMAIL US</span>
                <strong>stay@luxurystay.com</strong>
              </div>
            </a>

            <a
              href="tel:+922112345678"
              className="contact-item"
            >
              <div className="contact-icon">
                <Phone size={18} />
              </div>

              <div>
                <span>CALL US</span>
                <strong>+92 21 1234 5678</strong>
              </div>
            </a>

            <div className="contact-item">
              <div className="contact-icon">
                <MapPin size={18} />
              </div>

              <div>
                <span>FIND US</span>
                <strong>Karachi, Pakistan</strong>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <Clock3 size={18} />
              </div>

              <div>
                <span>GUEST SUPPORT</span>
                <strong>Available 24 hours</strong>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="contact-form-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.1,
          }}
        >
          <div className="form-top">
            <span>PERSONAL CONCIERGE</span>
            <Send size={18} />
          </div>

          <h3>How can we help?</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-group">
                <label>YOUR NAME</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="input-group">
                <label>EMAIL ADDRESS</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>PHONE</label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+92"
                />
              </div>

              <div className="input-group">
                <label>ENQUIRY TYPE</label>

                <select
                  name="enquiryType"
                  value={formData.enquiryType}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select enquiry
                  </option>

                  <option value="Room Reservation">
                    Room Reservation
                  </option>

                  <option value="Dining">
                    Dining
                  </option>

                  <option value="Spa & Wellness">
                    Spa & Wellness
                  </option>

                  <option value="Private Transfer">
                    Private Transfer
                  </option>

                  <option value="General Enquiry">
                    General Enquiry
                  </option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>YOUR MESSAGE</label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Tell us how we can make your stay special..."
                required
              ></textarea>
            </div>

            {statusMessage && (
              <div
                className={`contact-form-message ${statusType}`}
              >
                {statusMessage}
              </div>
            )}

            <button
              className="contact-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Sending..."
                : "Send Your Enquiry"}

              {!submitting && (
                <ArrowUpRight size={18} />
              )}
            </button>

            <small>
              Our guest team usually responds within a few hours.
            </small>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

export default Contact;