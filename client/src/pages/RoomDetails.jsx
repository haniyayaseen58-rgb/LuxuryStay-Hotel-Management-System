import { useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BedDouble,
  Users,
  Maximize2,
  Wifi,
  Coffee,
  Bath,
  Sparkles,
  Check,
} from "lucide-react";

import sereneRoom from "../assets/serene-room.jpg";
import signatureSuite from "../assets/signature-suite.jpg";
import royalResidence from "../assets/royal-residence.jpg";

import sereneBathroom from "../assets/serene-bathroom.jpg";
import sereneBalcony from "../assets/serene-balcony.jpg";
import sereneLiving from "../assets/serene-living-area.jpg";

import signatureBathroom from "../assets/signature-bathroom.jpg";
import signatureView from "../assets/signature-view.jpg";
import signatureLiving from "../assets/signature-living-area.jpg";

import royalBathroom from "../assets/royal-bathroom.jpg";
import royalView from "../assets/royal-view.jpg";
import royalLiving from "../assets/royal-living-area.jpg";

import "./RoomDetails.css";

const roomData = {
  1: {
    name: "The Serene Room",
    category: "DELUXE RETREAT",
    price: 25000,
    guests: 2,
    bed: "King Bed",
    size: "42 m²",
    image: sereneRoom,
    description:
      "A peaceful private retreat where warm textures, elegant details and effortless comfort come together.",
    gallery: [
      {
        image: sereneRoom,
        title: "The Bedroom",
        label: "REST",
      },
      {
        image: sereneBathroom,
        title: "Private Bathroom",
        label: "REFRESH",
      },
      {
        image: sereneBalcony,
        title: "Morning View",
        label: "BREATHE",
      },
      {
        image: sereneLiving,
        title: "Living Space",
        label: "UNWIND",
      },
    ],
  },

  2: {
    name: "The Signature Suite",
    category: "SIGNATURE COLLECTION",
    price: 40000,
    guests: 3,
    bed: "King Bed",
    size: "65 m²",
    image: signatureSuite,
    description:
      "A refined suite created around spacious interiors, thoughtful details and memorable nights.",
    gallery: [
      {
        image: signatureSuite,
        title: "The Signature Bedroom",
        label: "REST",
      },
      {
        image: signatureBathroom,
        title: "Private Bathroom",
        label: "REFRESH",
      },
      {
        image: signatureView,
        title: "Panoramic Night View",
        label: "DISCOVER",
      },
      {
        image: signatureLiving,
        title: "Signature Living Space",
        label: "UNWIND",
      },
    ],
  },

  3: {
    name: "The Royal Residence",
    category: "EXCLUSIVE RESIDENCE",
    price: 65000,
    guests: 4,
    bed: "2 King Beds",
    size: "110 m²",
    image: royalResidence,
    description:
      "An extraordinary private residence offering generous spaces, elevated comfort and exceptional privacy.",
    gallery: [
      {
        image: royalResidence,
        title: "The Royal Bedroom",
        label: "REST",
      },
      {
        image: royalBathroom,
        title: "Royal Bathroom",
        label: "REFRESH",
      },
      {
        image: royalView,
        title: "Private Royal Terrace",
        label: "ESCAPE",
      },
      {
        image: royalLiving,
        title: "Grand Living Space",
        label: "INDULGE",
      },
    ],
  },
};

function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const room = roomData[id];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date) =>
    date.toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(
    String(Math.min(2, room?.guests || 1))
  );
  const [bookingError, setBookingError] =
    useState("");

  if (!room) {
    return (
      <div className="room-not-found">
        <h1>Room not found</h1>

        <Link to="/">
          Return Home
        </Link>
      </div>
    );
  }

  const handleReserveRoom = () => {
    setBookingError("");

    if (!checkIn || !checkOut) {
      setBookingError(
        "Please select check-in and check-out dates."
      );
      return;
    }

    const checkInDate = new Date(
      `${checkIn}T00:00:00`
    );

    const checkOutDate = new Date(
      `${checkOut}T00:00:00`
    );

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (checkInDate < currentDate) {
      setBookingError(
        "Check-in date cannot be in the past."
      );
      return;
    }

    if (checkOutDate <= checkInDate) {
      setBookingError(
        "Check-out date must be after check-in date."
      );
      return;
    }

    if (Number(guests) > room.guests) {
      setBookingError(
        `This room allows maximum ${room.guests} guests.`
      );
      return;
    }

    const bookingSearch = {
      checkIn,
      checkOut,
      guests: Number(guests),
      publicRoomId: id,
      roomName: room.name,
    };

    sessionStorage.setItem(
      "luxurystaySearch",
      JSON.stringify(bookingSearch)
    );

    const token =
      localStorage.getItem("token");

    let user = null;

    try {
      user = JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      user = null;
    }

    if (token && user?.role === "guest") {
      navigate("/guest/book-room", {
        state: bookingSearch,
      });
      return;
    }

    navigate("/auth", {
      state: {
        from: "/guest/book-room",
        bookingSearch,
      },
    });
  };

  return (
    <main className="details-page">
      <section className="details-hero">
        <motion.div
          className="details-top"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <Link
            to="/#rooms"
            className="back-link"
          >
            <ArrowLeft size={17} />
            Back to collection
          </Link>

          <span className="details-category">
            {room.category}
          </span>

          <h1>{room.name}</h1>

          <p>{room.description}</p>
        </motion.div>

        <motion.div
          className="details-main-image"
          initial={{
            opacity: 0,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
          }}
        >
          <img
            src={room.image}
            alt={room.name}
          />

          <div className="details-image-overlay"></div>

          <div className="image-caption">
            <span>01</span>
            <p>THE EXPERIENCE</p>
          </div>
        </motion.div>
      </section>

      <section className="details-content">
        <div className="details-left">
          <span className="section-small">
            YOUR PRIVATE ESCAPE
          </span>

          <h2>
            Designed around
            <span> your comfort.</span>
          </h2>

          <p className="details-description">
            From quiet mornings to slow evenings, every detail has been
            thoughtfully considered to create a stay that feels effortless,
            private and beautifully personal.
          </p>

          <div className="details-features">
            <div>
              <Users size={20} />
              <span>GUESTS</span>
              <strong>
                {room.guests} Guests
              </strong>
            </div>

            <div>
              <BedDouble size={20} />
              <span>BED</span>
              <strong>{room.bed}</strong>
            </div>

            <div>
              <Maximize2 size={20} />
              <span>SPACE</span>
              <strong>{room.size}</strong>
            </div>

            <div>
              <Bath size={20} />
              <span>BATHROOM</span>
              <strong>
                Private Bath
              </strong>
            </div>
          </div>

          <div className="amenities">
            <h3>
              Thoughtful comforts
            </h3>

            <div className="amenities-grid">
              <span>
                <Wifi size={16} />
                High-Speed WiFi
              </span>

              <span>
                <Coffee size={16} />
                Coffee & Tea
              </span>

              <span>
                <Bath size={16} />
                Luxury Bathroom
              </span>

              <span>
                <Sparkles size={16} />
                Daily Housekeeping
              </span>

              <span>
                <Check size={16} />
                Premium Toiletries
              </span>

              <span>
                <Check size={16} />
                24/7 Guest Service
              </span>
            </div>
          </div>
        </div>

        <motion.aside
          className="details-booking"
          initial={{
            opacity: 0,
            x: 30,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <span className="booking-small">
            YOUR STAY
          </span>

          <div className="details-price">
            <strong>
              Rs.{" "}
              {Number(
                room.price
              ).toLocaleString()}
            </strong>

            <span>/ night</span>
          </div>

          <div className="booking-date-row">
            <div>
              <label>
                CHECK IN
              </label>

              <input
                type="date"
                aria-label="Check in date"
                min={formatDate(today)}
                value={checkIn}
                onChange={(event) => {
                  setCheckIn(
                    event.target.value
                  );
                  setBookingError("");
                }}
              />
            </div>

            <div>
              <label>
                CHECK OUT
              </label>

              <input
                type="date"
                aria-label="Check out date"
                min={
                  checkIn ||
                  formatDate(tomorrow)
                }
                value={checkOut}
                onChange={(event) => {
                  setCheckOut(
                    event.target.value
                  );
                  setBookingError("");
                }}
              />
            </div>
          </div>

          <label className="guest-label">
            GUESTS
          </label>

          <select
            value={guests}
            aria-label="Number of guests"
            onChange={(event) => {
              setGuests(
                event.target.value
              );
              setBookingError("");
            }}
          >
            {Array.from(
              {
                length: room.guests,
              },
              (_, index) =>
                index + 1
            ).map((count) => (
              <option
                key={count}
                value={count}
              >
                {count}{" "}
                {count === 1
                  ? "Guest"
                  : "Guests"}
              </option>
            ))}
          </select>

          {bookingError && (
            <small
              style={{
                display: "block",
                marginTop: "12px",
                marginBottom: "4px",
              }}
            >
              {bookingError}
            </small>
          )}

          <button
            type="button"
            className="reserve-room-btn"
            onClick={
              handleReserveRoom
            }
          >
            Reserve This Room
            <ArrowUpRight
              size={18}
            />
          </button>

          <small>
            No payment required at
            this stage.
          </small>
        </motion.aside>
      </section>

      <section className="room-gallery-section">
        <div className="gallery-heading">
          <span>
            EXPLORE THE SPACE
          </span>

          <h2>
            More than a room.
            <em>
              {" "}
              A complete escape.
            </em>
          </h2>

          <p>
            Discover the bedroom, private bathroom, views and beautifully
            designed living spaces.
          </p>
        </div>

        <div className="room-gallery-grid">
          {room.gallery.map(
            (item, index) => (
              <motion.div
                className={`gallery-card gallery-card-${
                  index + 1
                }`}
                key={`${room.name}-${index}`}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.65,
                  delay:
                    index * 0.1,
                }}
              >
                <img
                  src={item.image}
                  alt={`${room.name} - ${item.title}`}
                />

                <div className="gallery-overlay"></div>

                <div className="gallery-card-info">
                  <span>
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                    {" · "}
                    {item.label}
                  </span>

                  <h3>
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            )
          )}
        </div>
      </section>
    </main>
  );
}

export default RoomDetails;