import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Users,
  Sparkles,
  Star,
} from "lucide-react";

import hotelHero from "../assets/hotel-hero.jpg";
import "./Hero.css";

function Hero() {
  const navigate = useNavigate();

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) =>
    date.toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(formatDate(today));
  const [checkOut, setCheckOut] = useState(
    formatDate(tomorrow)
  );
  const [guests, setGuests] = useState("2");
  const [bookingError, setBookingError] = useState("");

  const handleDiscoverRooms = () => {
    const roomsSection = document.getElementById("rooms");

    if (roomsSection) {
      roomsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleAvailability = () => {
    setBookingError("");

    if (!checkIn || !checkOut) {
      setBookingError(
        "Please select check-in and check-out dates."
      );
      return;
    }

    const checkInDate = new Date(`${checkIn}T00:00:00`);
    const checkOutDate = new Date(`${checkOut}T00:00:00`);
    const todayDate = new Date();

    todayDate.setHours(0, 0, 0, 0);

    if (checkInDate < todayDate) {
      setBookingError(
        "Check-in date cannot be in the past."
      );
      return;
    }

    if (checkOutDate <= checkInDate) {
      setBookingError(
        "Check-out must be after check-in."
      );
      return;
    }

    const searchData = {
      checkIn,
      checkOut,
      guests: Number(guests),
    };

    sessionStorage.setItem(
      "luxurystaySearch",
      JSON.stringify(searchData)
    );

    const token = localStorage.getItem("token");
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (token && user?.role === "guest") {
      navigate("/guest/book-room", {
        state: searchData,
      });
      return;
    }

    navigate("/auth", {
      state: {
        from: "/guest/book-room",
        bookingSearch: searchData,
      },
    });
  };

  return (
    <section className="hero" id="home">
      <div className="hero-glow hero-glow-one"></div>
      <div className="hero-glow hero-glow-two"></div>

      <div className="hero-content">
        <motion.div
          className="hero-left"
          initial={{ opacity: 0, x: -45 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-label">
            <Sparkles size={15} />
            <span>
              WHERE EVERY STAY BECOMES A STORY
            </span>
          </div>

          <h1>
            Stay somewhere
            <span> unforgettable.</span>
          </h1>

          <p className="hero-description">
            Thoughtfully designed spaces, effortless
            hospitality and memorable experiences — all
            brought together in one extraordinary stay.
          </p>

          <div className="hero-buttons">
            <button
              className="hero-primary"
              onClick={handleDiscoverRooms}
            >
              Discover Our Rooms
              <ArrowUpRight size={18} />
            </button>

            <a href="#about" className="hero-link">
              Explore LuxuryStay
              <span></span>
            </a>
          </div>

          <div className="hero-trust">
            <div className="guest-faces">
              <div>A</div>
              <div>M</div>
              <div>S</div>
              <div>+</div>
            </div>

            <div className="trust-info">
              <div className="stars">
                <Star size={13} fill="currentColor" />
                <Star size={13} fill="currentColor" />
                <Star size={13} fill="currentColor" />
                <Star size={13} fill="currentColor" />
                <Star size={13} fill="currentColor" />
              </div>

              <span>Loved by 2,000+ guests</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.9,
            delay: 0.15,
          }}
        >
          <div className="visual-frame">
            <div className="hero-image-wrapper">
              <img
                src={hotelHero}
                alt="LuxuryStay premium hotel suite"
                className="hero-hotel-image"
              />

              <div className="hero-image-overlay"></div>

              <div className="image-branding">
                <Sparkles size={30} />
                <span>LuxuryStay</span>
                <small>
                  YOUR EXTRAORDINARY ESCAPE AWAITS
                </small>
              </div>
            </div>

            <div className="floating-card">
              <span className="floating-small">
                SIGNATURE SUITE
              </span>

              <strong>
                Serene. Private. Yours.
              </strong>

              <span className="floating-price">
                From <b>Rs. 40,000</b> / night
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="booking-panel"
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          delay: 0.55,
        }}
      >
        <div className="booking-intro">
          <span>PLAN YOUR ESCAPE</span>
          <strong>Find your perfect stay</strong>
        </div>

        <div className="booking-divider"></div>

        <div className="booking-field">
          <CalendarDays size={19} />

          <div>
            <span>CHECK IN</span>

            <input
              type="date"
              value={checkIn}
              min={formatDate(today)}
              onChange={(event) => {
                setCheckIn(event.target.value);
                setBookingError("");
              }}
              aria-label="Check in date"
            />
          </div>
        </div>

        <div className="booking-field">
          <CalendarDays size={19} />

          <div>
            <span>CHECK OUT</span>

            <input
              type="date"
              value={checkOut}
              min={checkIn || formatDate(today)}
              onChange={(event) => {
                setCheckOut(event.target.value);
                setBookingError("");
              }}
              aria-label="Check out date"
            />
          </div>
        </div>

        <div className="booking-field">
          <Users size={19} />

          <div>
            <span>GUESTS</span>

            <select
              value={guests}
              onChange={(event) =>
                setGuests(event.target.value)
              }
              aria-label="Number of guests"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5+ Guests</option>
            </select>
          </div>
        </div>

        <button
          className="availability-btn"
          onClick={handleAvailability}
        >
          Check Availability
          <ArrowUpRight size={18} />
        </button>

        {bookingError && (
          <div className="hero-booking-error">
            {bookingError}
          </div>
        )}
      </motion.div>
    </section>
  );
}

export default Hero;