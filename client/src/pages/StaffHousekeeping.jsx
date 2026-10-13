import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  BedDouble,
  Layers3,
  CheckCircle2,
  RefreshCw,
  Hotel,
  Clock3,
} from "lucide-react";

import "./StaffHousekeeping.css";

function StaffHousekeeping() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchHousekeepingRooms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/rooms/housekeeping",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load housekeeping rooms."
        );
      }

      setRooms(data.rooms || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHousekeepingRooms();
  }, []);

  const handleCompleteCleaning = async (roomId) => {
    try {
      setCompletingId(roomId);
      setMessage("");
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/rooms/housekeeping/${roomId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to complete room cleaning."
        );
      }

      setRooms((currentRooms) =>
        currentRooms.filter((room) => room._id !== roomId)
      );

      setMessage(
        `Room ${data.room.roomNumber} is clean and available for the next guest.`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setCompletingId("");
    }
  };

  return (
    <div className="staff-housekeeping-page">
      <div className="housekeeping-glow housekeeping-glow-one"></div>
      <div className="housekeeping-glow housekeeping-glow-two"></div>

      <header className="housekeeping-header">
        <button
          className="housekeeping-back-btn"
          type="button"
          onClick={() => navigate("/staff")}
        >
          <ArrowLeft size={18} />
         Back to Manager Dashboard
        </button>

        <div className="housekeeping-brand">
          <div className="housekeeping-brand-icon">
            <Hotel size={22} />
          </div>

          <div>
            <strong>LuxuryStay</strong>
            <span>Housekeeping Operations</span>
          </div>
        </div>
      </header>

      <main className="housekeeping-main">
        <section className="housekeeping-hero">
          <div className="housekeeping-hero-content">
            <div className="housekeeping-eyebrow">
              <Sparkles size={16} />
              LIVE HOUSEKEEPING DESK
            </div>

            <h1>
              Prepare every room for an
              <span> exceptional stay.</span>
            </h1>

            <p>
              Rooms enter this workspace automatically after guest
              check-out. Complete the cleaning task to return a room
              to available status.
            </p>
          </div>

          <div className="housekeeping-summary-card">
            <div className="summary-icon">
              <Sparkles size={27} />
            </div>

            <div>
              <span>Rooms Awaiting Service</span>
              <strong>{rooms.length}</strong>
            </div>

            <div className="summary-live">
              <span></span>
              Live
            </div>
          </div>
        </section>

        {message && (
          <div className="housekeeping-message success">
            <CheckCircle2 size={20} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="housekeeping-message error">
            <span>{error}</span>
          </div>
        )}

        <section className="housekeeping-workspace">
          <div className="housekeeping-section-heading">
            <div>
              <span>CLEANING QUEUE</span>
              <h2>Rooms Requiring Attention</h2>
              <p>
                Complete each room only after housekeeping service
                has been finished.
              </p>
            </div>

            <button
              className="housekeeping-refresh-btn"
              type="button"
              onClick={fetchHousekeepingRooms}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={loading ? "refresh-spinning" : ""}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="housekeeping-loading">
              <div className="housekeeping-loader"></div>
              <strong>Preparing housekeeping desk...</strong>
              <span>Loading rooms awaiting cleaning</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="housekeeping-empty">
              <div className="housekeeping-empty-icon">
                <CheckCircle2 size={34} />
              </div>

              <span className="housekeeping-empty-label">
                ALL CLEAR
              </span>

              <h3>No rooms are waiting for cleaning</h3>

              <p>
                Newly checked-out rooms will automatically appear
                here when housekeeping service is required.
              </p>

              <button
                type="button"
                onClick={() => navigate("/staff/rooms")}
              >
                View Room Status
              </button>
            </div>
          ) : (
            <div className="housekeeping-room-grid">
              {rooms.map((room, index) => (
                <article
                  className="housekeeping-room-card"
                  key={room._id}
                  style={{
                    animationDelay: `${index * 0.08}s`,
                  }}
                >
                  <div className="housekeeping-card-top">
                    <div className="housekeeping-room-number">
                      <span>ROOM</span>
                      <strong>{room.roomNumber}</strong>
                    </div>

                    <div className="housekeeping-status">
                      <span></span>
                      Cleaning Required
                    </div>
                  </div>

                  <div className="housekeeping-room-name">
                    <h3>{room.name}</h3>
                    <p>{room.type}</p>
                  </div>

                  <div className="housekeeping-room-details">
                    <div>
                      <BedDouble size={18} />
                      <span>
                        <small>Bed Type</small>
                        <strong>{room.bedType}</strong>
                      </span>
                    </div>

                    <div>
                      <Layers3 size={18} />
                      <span>
                        <small>Floor</small>
                        <strong>{room.floor}</strong>
                      </span>
                    </div>

                    <div>
                      <Clock3 size={18} />
                      <span>
                        <small>Status</small>
                        <strong>Awaiting Service</strong>
                      </span>
                    </div>
                  </div>

                  <div className="housekeeping-card-note">
                    <Sparkles size={17} />

                    <p>
                      Inspect bedding, bathroom, amenities and room
                      presentation before marking this task complete.
                    </p>
                  </div>

                  <button
                    className="housekeeping-complete-btn"
                    type="button"
                    disabled={completingId === room._id}
                    onClick={() =>
                      handleCompleteCleaning(room._id)
                    }
                  >
                    {completingId === room._id ? (
                      <>
                        <RefreshCw
                          size={18}
                          className="refresh-spinning"
                        />
                        Completing Service...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={19} />
                        Mark Cleaning Complete
                      </>
                    )}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StaffHousekeeping;