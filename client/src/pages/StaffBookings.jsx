import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  RefreshCw,
  BedDouble,
  Users,
  CalendarDays,
  UserRound,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Banknote,
  Hotel,
  Clock3,
  CheckCircle2,
  DoorOpen,
} from "lucide-react";

import API_BASE_URL from "../config/api";
import "./StaffBookings.css";

function StaffBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/staff`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to load bookings."
        );
        setMessageType("error");
        return;
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Staff Bookings Error:", error);

      setMessage("Unable to connect to the server.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const confirmedBookings = bookings.filter(
    (booking) =>
      booking.bookingStatus === "confirmed"
  ).length;

  const checkedInBookings = bookings.filter(
    (booking) =>
      booking.bookingStatus === "checked-in"
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      booking.bookingStatus === "checked-out"
  ).length;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatStatus = (status) => {
    if (!status) return "—";

    return status
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const getStatusIcon = (status) => {
    if (status === "confirmed") {
      return <CheckCircle2 size={15} />;
    }

    if (status === "checked-in") {
      return <Hotel size={15} />;
    }

    if (status === "checked-out") {
      return <DoorOpen size={15} />;
    }

    return <Clock3 size={15} />;
  };

  return (
    <main className="staff-bookings-page">
      <div className="staff-bookings-bg">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="staff-bookings-container">
        <button
          type="button"
          className="staff-bookings-back"
          onClick={() => navigate("/staff")}
        >
          <ArrowLeft size={18} />
          Back to Manager Dashboard
        </button>

        <section className="staff-bookings-hero">
          <div>
            <span className="staff-bookings-eyebrow">
              RESERVATION DESK
            </span>

            <h1>Guest Bookings</h1>

            <p>
              View verified reservations, monitor arrivals
              and track active guest stays from one
              intelligent workspace.
            </p>
          </div>

          <div className="staff-bookings-hero-icon">
            <CalendarCheck size={32} />
          </div>
        </section>

        <section className="staff-bookings-stats">
          <article>
            <div className="staff-bookings-stat-icon confirmed">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <strong>{confirmedBookings}</strong>
              <span>Confirmed</span>
            </div>
          </article>

          <article>
            <div className="staff-bookings-stat-icon active">
              <Hotel size={21} />
            </div>

            <div>
              <strong>{checkedInBookings}</strong>
              <span>Checked-In</span>
            </div>
          </article>

          <article>
            <div className="staff-bookings-stat-icon completed">
              <DoorOpen size={21} />
            </div>

            <div>
              <strong>{completedBookings}</strong>
              <span>Completed</span>
            </div>
          </article>

          <article>
            <div className="staff-bookings-stat-icon total">
              <CalendarCheck size={21} />
            </div>

            <div>
              <strong>{bookings.length}</strong>
              <span>Total Records</span>
            </div>
          </article>
        </section>

        <section className="staff-bookings-panel">
          <div className="staff-bookings-panel-heading">
            <div>
              <span>VERIFIED RESERVATIONS</span>
              <h2>Booking Records</h2>
            </div>

            <button
              type="button"
              onClick={fetchBookings}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {message && (
            <div
              className={`staff-bookings-message ${messageType}`}
            >
              {messageType === "success" && (
                <CheckCircle2 size={17} />
              )}

              {messageType === "error" && (
                <Clock3 size={17} />
              )}

              <span>{message}</span>
            </div>
          )}

          {loading ? (
            <div className="staff-bookings-loading">
              <RefreshCw size={31} />

              <strong>
                Loading reservations...
              </strong>

              <span>
                Getting verified guest bookings.
              </span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="staff-bookings-empty">
              <CalendarCheck size={36} />

              <strong>
                No confirmed bookings
              </strong>

              <span>
                Admin-approved reservations will
                automatically appear here.
              </span>
            </div>
          ) : (
            <div className="staff-bookings-grid">
              {bookings.map((booking) => (
                <article
                  className="staff-booking-card"
                  key={booking._id}
                >
                  <div className="staff-booking-card-top">
                    <div>
                      <span className="staff-booking-reference">
                        RESERVATION
                      </span>

                      <strong>
                        #
                        {booking._id
                          ?.slice(-6)
                          .toUpperCase()}
                      </strong>
                    </div>

                    <div
                      className={`staff-booking-status status-${booking.bookingStatus}`}
                    >
                      {getStatusIcon(
                        booking.bookingStatus
                      )}

                      <span>
                        {formatStatus(
                          booking.bookingStatus
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="staff-booking-room">
                    <div className="staff-booking-room-icon">
                      <BedDouble size={22} />
                    </div>

                    <div>
                      <span>
                        ROOM{" "}
                        {booking.room?.roomNumber ||
                          "—"}
                      </span>

                      <h3>
                        {booking.room?.name ||
                          "Room unavailable"}
                      </h3>

                      <p>
                        {booking.room?.type || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="staff-booking-dates">
                    <div>
                      <CalendarDays size={17} />

                      <span>
                        <small>CHECK-IN</small>

                        <strong>
                          {formatDate(
                            booking.checkInDate
                          )}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <CalendarDays size={17} />

                      <span>
                        <small>CHECK-OUT</small>

                        <strong>
                          {formatDate(
                            booking.checkOutDate
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="staff-booking-guest">
                    <div className="staff-booking-section-title">
                      <UserRound size={15} />

                      <span>
                        GUEST INFORMATION
                      </span>
                    </div>

                    <h4>
                      {booking.guestDetails
                        ?.fullName ||
                        booking.guest?.name ||
                        "Guest"}
                    </h4>

                    <div className="staff-booking-contact">
                      <span>
                        <Mail size={14} />

                        {booking.guestDetails
                          ?.email ||
                          booking.guest?.email ||
                          "—"}
                      </span>

                      <span>
                        <Phone size={14} />

                        {booking.guestDetails
                          ?.phone || "—"}
                      </span>

                      <span>
                        <MapPin size={14} />

                        {booking.guestDetails
                          ?.nationality || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="staff-booking-details">
                    <div>
                      <Users size={15} />

                      <span>
                        {booking.numberOfGuests}{" "}
                        {booking.numberOfGuests === 1
                          ? "Guest"
                          : "Guests"}
                      </span>
                    </div>

                    <div>
                      <CalendarCheck size={15} />

                      <span>
                        {booking.totalNights}{" "}
                        {booking.totalNights === 1
                          ? "Night"
                          : "Nights"}
                      </span>
                    </div>

                    <div>
                      <Banknote size={15} />

                      <span>
                        Rs.{" "}
                        {Number(
                          booking.totalAmount || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="staff-booking-verification">
                    <div>
                      <ShieldCheck size={16} />

                      <span>
                        Identity Verification
                      </span>
                    </div>

                    <strong
                      className={`verification-${booking.verificationStatus}`}
                    >
                      {formatStatus(
                        booking.verificationStatus
                      )}
                    </strong>
                  </div>

                  {booking.specialRequests && (
                    <div className="staff-booking-request">
                      <span>
                        SPECIAL REQUEST
                      </span>

                      <p>
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}

                  {booking.bookingStatus ===
                    "confirmed" && (
                    <div className="staff-booking-record-note">
                      <CheckCircle2 size={18} />

                      <div>
                        <span>
                          CONFIRMED RESERVATION
                        </span>

                        <strong>
                          Ready for Check-In
                        </strong>
                      </div>
                    </div>
                  )}

                  {booking.bookingStatus ===
                    "checked-in" && (
                    <div className="staff-checkedin-zone">
                      <div className="staff-checkedin-pulse">
                        <span></span>
                      </div>

                      <div>
                        <span>ACTIVE STAY</span>

                        <strong>
                          Guest Checked In
                        </strong>

                        <small>
                          {formatDateTime(
                            booking.checkedInAt
                          )}
                        </small>
                      </div>

                      <Hotel size={22} />
                    </div>
                  )}

                  {booking.bookingStatus ===
                    "checked-out" && (
                    <div className="staff-completed-zone">
                      <CheckCircle2 size={19} />

                      <div>
                        <span>
                          STAY COMPLETED
                        </span>

                        <strong>
                          Guest Checked Out
                        </strong>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default StaffBookings;