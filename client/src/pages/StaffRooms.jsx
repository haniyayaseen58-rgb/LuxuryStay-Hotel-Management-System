import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  Users,
  Banknote,
  Layers3,
  RefreshCw,
  CheckCircle2,
  Hotel,
  Sparkles,
  Wrench,
  CalendarCheck,
  DoorOpen,
  Eye,
} from "lucide-react";

import "./StaffRooms.css";

function StaffRooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/rooms",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load rooms.");
        return;
      }

      setRooms(data.rooms || []);
    } catch (error) {
      console.error("Load Rooms Error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const availableRooms = rooms.filter(
    (room) => room.status === "available"
  ).length;

  const occupiedRooms = rooms.filter(
    (room) => room.status === "occupied"
  ).length;

  const reservedRooms = rooms.filter(
    (room) => room.status === "reserved"
  ).length;

  const serviceRooms = rooms.filter(
    (room) =>
      room.status === "cleaning" ||
      room.status === "maintenance"
  ).length;

  const getStatusIcon = (status) => {
    if (status === "available") {
      return <CheckCircle2 size={17} />;
    }

    if (status === "occupied") {
      return <DoorOpen size={17} />;
    }

    if (status === "reserved") {
      return <CalendarCheck size={17} />;
    }

    if (status === "cleaning") {
      return <Sparkles size={17} />;
    }

    return <Wrench size={17} />;
  };

  const getStatusLabel = (status) => {
    if (status === "available") {
      return "Available";
    }

    if (status === "occupied") {
      return "Occupied";
    }

    if (status === "reserved") {
      return "Reserved";
    }

    if (status === "cleaning") {
      return "Cleaning";
    }

    if (status === "maintenance") {
      return "Maintenance";
    }

    return status;
  };

  return (
    <main className="staff-rooms-page">
      <div className="staff-rooms-background">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="staff-rooms-container">
        <button
          type="button"
          className="staff-rooms-back"
          onClick={() => navigate("/staff")}
        >
          <ArrowLeft size={18} />
          Back to Manager Dashboard
        </button>

        <section className="staff-rooms-hero">
          <div>
            <span className="staff-rooms-eyebrow">
              LIVE HOTEL OPERATIONS
            </span>

            <h1>Room Status</h1>

            <p>
              Monitor live room availability and operational
              status across LuxuryStay.
            </p>
          </div>

          <div className="staff-rooms-hero-icon">
            <Hotel size={31} />
          </div>
        </section>

        <section className="staff-room-stats">
          <article>
            <div className="staff-room-stat-icon available">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <strong>{availableRooms}</strong>
              <span>Available</span>
            </div>
          </article>

          <article>
            <div className="staff-room-stat-icon occupied">
              <DoorOpen size={20} />
            </div>

            <div>
              <strong>{occupiedRooms}</strong>
              <span>Occupied</span>
            </div>
          </article>

          <article>
            <div className="staff-room-stat-icon reserved">
              <CalendarCheck size={20} />
            </div>

            <div>
              <strong>{reservedRooms}</strong>
              <span>Reserved</span>
            </div>
          </article>

          <article>
            <div className="staff-room-stat-icon service">
              <Sparkles size={20} />
            </div>

            <div>
              <strong>{serviceRooms}</strong>
              <span>Service</span>
            </div>
          </article>
        </section>

        <section className="staff-room-control-panel">
          <div className="staff-room-control-heading">
            <div>
              <span>ROOM INVENTORY</span>
              <h2>Live Room Status</h2>
            </div>

            <button
              type="button"
              onClick={fetchRooms}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {message && (
            <div className="staff-room-message">
              {message}
            </div>
          )}

          {loading ? (
            <div className="staff-rooms-loading">
              <RefreshCw size={29} />

              <strong>Loading room inventory...</strong>

              <span>
                Fetching the latest room status from LuxuryStay.
              </span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="staff-rooms-empty">
              <BedDouble size={31} />

              <strong>No rooms available</strong>

              <span>
                Rooms created by Admin will appear here.
              </span>
            </div>
          ) : (
            <div className="staff-room-card-grid">
              {rooms.map((room) => (
                <article
                  className="staff-room-card"
                  key={room._id}
                >
                  <div className="staff-room-card-top">
                    <div className="staff-room-number">
                      <span>ROOM</span>
                      <strong>{room.roomNumber}</strong>
                    </div>

                    <div
                      className={`staff-current-status status-${room.status}`}
                    >
                      {getStatusIcon(room.status)}
                      <span>
                        {getStatusLabel(room.status)}
                      </span>
                    </div>
                  </div>

                  <div className="staff-room-card-body">
                    <span className="staff-room-type">
                      {room.type}
                    </span>

                    <h3>{room.name}</h3>

                    <div className="staff-room-details">
                      <div>
                        <Users size={15} />

                        <span>
                          {room.capacity}{" "}
                          {room.capacity === 1
                            ? "Guest"
                            : "Guests"}
                        </span>
                      </div>

                      <div>
                        <BedDouble size={15} />
                        <span>{room.bedType}</span>
                      </div>

                      <div>
                        <Layers3 size={15} />
                        <span>Floor {room.floor}</span>
                      </div>

                      <div>
                        <Banknote size={15} />

                        <span>
                          Rs.{" "}
                          {Number(
                            room.pricePerNight
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="staff-room-status-control">
                    <label>
                      <Eye size={14} />
                      CURRENT ROOM STATUS
                    </label>

                    <div
                      className={`staff-current-status status-${room.status}`}
                    >
                      {getStatusIcon(room.status)}

                      <span>
                        {getStatusLabel(room.status)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default StaffRooms;