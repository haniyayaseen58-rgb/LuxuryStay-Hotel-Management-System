import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Gem,
  UserRound,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = () => {
    setMenuOpen(false);
    navigate("/auth");
  };

  const handleReserveStay = () => {
    setMenuOpen(false);

    const token = localStorage.getItem("token");

    let user = null;

    try {
      user = JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      user = null;
    }

    if (token && user?.role === "guest") {
      navigate("/guest/book-room");
      return;
    }

    navigate("/auth", {
      state: {
        from: "/guest/book-room",
      },
    });
  };

  return (
    <motion.header
      className="luxury-navbar"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
    >
      <div className="nav-container">
        <a href="#home" className="luxury-brand">
          <div className="brand-emblem">
            <Gem size={20} strokeWidth={1.5} />
          </div>

          <div className="brand-text">
            <span className="brand-name">
              LUXURY<span>STAY</span>
            </span>
            <small>HOTEL & RESORT</small>
          </div>
        </a>

        <nav
          className={`nav-menu ${
            menuOpen ? "active" : ""
          }`}
        >
          <a
            href="#home"
            onClick={() => setMenuOpen(false)}
          >
            <span>01</span> Home
          </a>

          <a
            href="#rooms"
            onClick={() => setMenuOpen(false)}
          >
            <span>02</span> Rooms
          </a>

          <a
            href="#services"
            onClick={() => setMenuOpen(false)}
          >
            <span>03</span> Experiences
          </a>

          <a
            href="#about"
            onClick={() => setMenuOpen(false)}
          >
            <span>04</span> Our Story
          </a>

          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
          >
            <span>05</span> Contact
          </a>
        </nav>

        <div className="nav-right">
          <button
            type="button"
            className="account-btn"
            onClick={handleSignIn}
          >
            <UserRound size={17} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            className="reserve-btn"
            onClick={handleReserveStay}
          >
            <span>Reserve Your Stay</span>
            <ArrowUpRight size={17} />
          </button>

          <button
            type="button"
            className="mobile-toggle"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Toggle menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </motion.header>
  );
}

export default Navbar;