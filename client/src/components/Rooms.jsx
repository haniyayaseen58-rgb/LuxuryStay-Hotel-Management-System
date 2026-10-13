import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BedDouble,
  Users,
  Maximize2,
  Sparkles,
} from "lucide-react";

import sereneRoom from "../assets/serene-room.jpg";
import signatureSuite from "../assets/signature-suite.jpg";
import royalResidence from "../assets/royal-residence.jpg";

import "./Rooms.css";

const rooms = [
  {
    id: 1,
    number: "01",
    type: "DELUXE RETREAT",
    name: "The Serene Room",
    description:
      "A peaceful private retreat designed with warm textures, elegant details and effortless comfort.",
    price: 25000,
    guests: 2,
    bed: "King Bed",
    size: "42 m²",
    image: sereneRoom,
    className: "room-one",
  },
  {
    id: 2,
    number: "02",
    type: "SIGNATURE COLLECTION",
    name: "The Signature Suite",
    description:
      "Spacious interiors, refined luxury and thoughtful details created for an unforgettable stay.",
    price: 40000,
    guests: 3,
    bed: "King Bed",
    size: "65 m²",
    image: signatureSuite,
    className: "room-two",
  },
  {
    id: 3,
    number: "03",
    type: "EXCLUSIVE RESIDENCE",
    name: "The Royal Residence",
    description:
      "Our most exclusive escape with exceptional space, privacy and elevated hotel living.",
    price: 65000,
    guests: 4,
    bed: "2 King Beds",
    size: "110 m²",
    image: royalResidence,
    className: "room-three",
  },
];

function Rooms() {
  return (
    <section className="rooms-section" id="rooms">
      <div className="rooms-container">
        <motion.div
          className="rooms-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="rooms-eyebrow">
            <Sparkles size={14} />
            <span>OUR COLLECTION</span>
          </div>

          <div className="rooms-title-row">
            <h2>
              Spaces made for
              <span> slow moments.</span>
            </h2>

            <p>
              Every LuxuryStay room is thoughtfully designed to feel personal,
              peaceful and beautifully unforgettable.
            </p>
          </div>
        </motion.div>

        <div className="rooms-grid">
          {rooms.map((room, index) => (
            <motion.article
              className="room-card"
              key={room.id}
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.65,
                delay: index * 0.12,
              }}
            >
              <div className={`room-visual ${room.className}`}>
                <img
                  src={room.image}
                  alt={room.name}
                  className="room-image"
                />

                <div className="room-image-shade"></div>

                <span className="room-number">
                  {room.number}
                </span>
              </div>

              <div className="room-info">
                <span className="room-category">
                  {room.type}
                </span>

                <h3>{room.name}</h3>

                <p>{room.description}</p>

                <div className="room-features">
                  <span>
                    <Users size={15} />
                    {room.guests} Guests
                  </span>

                  <span>
                    <BedDouble size={15} />
                    {room.bed}
                  </span>

                  <span>
                    <Maximize2 size={15} />
                    {room.size}
                  </span>
                </div>

                <div className="room-bottom">
                  <div className="room-price">
                    <small>FROM</small>

                    <strong>
                      Rs. {room.price.toLocaleString()}
                    </strong>

                    <span>/ night</span>
                  </div>

                  <Link
                    to={`/rooms/${room.id}`}
                    className="room-button"
                  >
                    View Details
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Rooms;