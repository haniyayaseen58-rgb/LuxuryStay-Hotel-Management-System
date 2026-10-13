import {
  Gem,
  ArrowUp,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa";

import "./Footer.css";

function Footer() {
  const goTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="footer">
      <div className="footer-curve"></div>

      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <Gem size={20} />

              <div>
                <span>
                  LUXURY<strong>STAY</strong>
                </span>
                <small>HOTEL & RESORT</small>
              </div>
            </div>

            <p>
              Beautiful stays, thoughtful hospitality
              and moments worth remembering.
            </p>

            <div className="footer-socials">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <span>EXPLORE</span>
              <a href="#home">Home</a>
              <a href="#rooms">Rooms</a>
              <a href="#services">Experiences</a>
              <a href="#about">Our Story</a>
            </div>

            <div className="footer-column">
              <span>CONTACT</span>

              <a href="mailto:stay@luxurystay.com">
                <Mail size={14} />
                stay@luxurystay.com
              </a>

              <a href="tel:+922112345678">
                <Phone size={14} />
                +92 21 1234 5678
              </a>

              <p>
                <MapPin size={14} />
                Karachi, Pakistan
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © 2026 LuxuryStay Hospitality. All rights reserved.
          </p>

          <span>
            Stay beautifully. Leave inspired.
          </span>

          <button
            type="button"
            onClick={goTop}
            aria-label="Back to top"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;