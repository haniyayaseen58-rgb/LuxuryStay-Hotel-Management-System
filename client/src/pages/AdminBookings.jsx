import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  Users,
  BedDouble,
  Banknote,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Hotel,
  CalendarDays,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import "./AdminBookings.css";

function AdminBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/bookings/admin",
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
      console.error("Load Bookings Error:", error);
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingAction = async (
    bookingId,
    action
  ) => {
    try {
      setActionLoading(`${bookingId}-${action}`);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/bookings/admin/${bookingId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            `Unable to ${action} booking.`
        );
        setMessageType("error");
        return;
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId
            ? data.booking
            : booking
        )
      );

      setMessage(
        action === "confirm"
          ? "Booking confirmed successfully!"
          : "Booking rejected successfully."
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "Booking Action Error:",
        error
      );

      setMessage("Unable to connect to the server.");
      setMessageType("error");
    } finally {
      setActionLoading("");
    }
  };

  const pendingBookings = bookings.filter(
    (booking) =>
      booking.bookingStatus === "pending"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) =>
      booking.bookingStatus === "confirmed"
  ).length;

  const activeBookings = bookings.filter(
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
      }
    );
  };

  const formatStatus = (status) => {
    if (!status) return "Pending";

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

    if (status === "rejected") {
      return <XCircle size={15} />;
    }

    if (status === "checked-in") {
      return <Hotel size={15} />;
    }

    if (status === "checked-out") {
      return <ShieldCheck size={15} />;
    }

    return <Clock3 size={15} />;
  };

  return (
    <main className="admin-bookings-page">
      <div className="admin-bookings-bg">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="admin-bookings-container">
        <button
          type="button"
          className="admin-bookings-back"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={18} />
          Back to Admin Dashboard
        </button>

        <section className="admin-bookings-hero">
          <div>
            <span className="admin-bookings-eyebrow">
              RESERVATION CONTROL
            </span>

            <h1>Booking Management</h1>

            <p>
              Review LuxuryStay reservations, guest
              information and upcoming stays from one
              place.
            </p>
          </div>

          <div className="admin-bookings-hero-icon">
            <CalendarCheck size={31} />
          </div>
        </section>

        <section className="admin-booking-stats">
          <article>
            <div className="admin-booking-stat-icon pending">
              <Clock3 size={20} />
            </div>

            <div>
              <strong>{pendingBookings}</strong>
              <span>Pending</span>
            </div>
          </article>

          <article>
            <div className="admin-booking-stat-icon confirmed">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <strong>{confirmedBookings}</strong>
              <span>Confirmed</span>
            </div>
          </article>

          <article>
            <div className="admin-booking-stat-icon active">
              <Hotel size={20} />
            </div>

            <div>
              <strong>{activeBookings}</strong>
              <span>Checked-In</span>
            </div>
          </article>

          <article>
            <div className="admin-booking-stat-icon completed">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>{completedBookings}</strong>
              <span>Completed</span>
            </div>
          </article>
        </section>

        <section className="admin-bookings-panel">
          <div className="admin-bookings-panel-heading">
            <div>
              <span>HOTEL RESERVATIONS</span>
              <h2>All Bookings</h2>
            </div>

            <div className="admin-bookings-heading-actions">
              <div className="admin-bookings-total">
                {bookings.length}{" "}
                {bookings.length === 1
                  ? "Booking"
                  : "Bookings"}
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
          </div>

          {message && (
            <div
              className={`admin-bookings-message ${messageType}`}
            >
              {message}
            </div>
          )}

          {loading ? (
            <div className="admin-bookings-loading">
              <RefreshCw size={30} />

              <strong>
                Loading reservations...
              </strong>

              <span>
                Fetching the latest booking
                information.
              </span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="admin-bookings-empty">
              <CalendarCheck size={34} />

              <strong>No bookings yet</strong>

              <span>
                Guest booking requests will appear here
                automatically.
              </span>
            </div>
          ) : (
            <div className="admin-bookings-grid">
              {bookings.map((booking) => (
                <article
                  className="admin-booking-card"
                  key={booking._id}
                >
                  <div className="admin-booking-card-top">
                    <div>
                      <span className="admin-booking-reference">
                        BOOKING
                      </span>

                      <strong>
                        #
                        {booking._id
                          ?.slice(-6)
                          .toUpperCase()}
                      </strong>
                    </div>

                    <div
                      className={`admin-booking-status status-${booking.bookingStatus}`}
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

                  <div className="admin-booking-room">
                    <div className="admin-booking-room-icon">
                      <BedDouble size={21} />
                    </div>

                    <div>
                      <span>
                        Room{" "}
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

                  <div className="admin-booking-dates">
                    <div>
                      <CalendarDays size={16} />

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
                      <CalendarDays size={16} />

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

                  <div className="admin-booking-guest">
                    <div className="admin-booking-section-title">
                      <UserRound size={15} />
                      <span>GUEST DETAILS</span>
                    </div>

                    <h4>
                      {booking.guestDetails
                        ?.fullName ||
                        booking.guest?.name ||
                        "Guest"}
                    </h4>

                    <div className="admin-booking-guest-info">
                      <span>
                        <Mail size={14} />

                        {booking.guestDetails?.email ||
                          booking.guest?.email ||
                          "—"}
                      </span>

                      <span>
                        <Phone size={14} />

                        {booking.guestDetails?.phone ||
                          "—"}
                      </span>

                      <span>
                        <MapPin size={14} />

                        {booking.guestDetails
                          ?.nationality || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-booking-summary">
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

                  <div className="admin-booking-verification">
                    <span>VERIFICATION</span>

                    <strong
                      className={`verification-${booking.verificationStatus}`}
                    >
                      {formatStatus(
                        booking.verificationStatus
                      )}
                    </strong>
                  </div>

                  {booking.bookingStatus ===
                    "pending" && (
                    <div className="admin-booking-actions">
                      <button
                        type="button"
                        className="confirm-booking-btn"
                        disabled={
                          actionLoading !== ""
                        }
                        onClick={() =>
                          handleBookingAction(
                            booking._id,
                            "confirm"
                          )
                        }
                      >
                        <CheckCircle2 size={17} />

                        {actionLoading ===
                        `${booking._id}-confirm`
                          ? "Confirming..."
                          : "Confirm Booking"}
                      </button>

                      <button
                        type="button"
                        className="reject-booking-btn"
                        disabled={
                          actionLoading !== ""
                        }
                        onClick={() =>
                          handleBookingAction(
                            booking._id,
                            "reject"
                          )
                        }
                      >
                        <XCircle size={17} />

                        {actionLoading ===
                        `${booking._id}-reject`
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
                    </div>
                  )}

                  {booking.bookingStatus ===
                    "confirmed" && (
                    <div className="admin-booking-confirmed-note">
                      <CheckCircle2 size={17} />
                      Reservation confirmed and verified
                    </div>
                  )}

                  {booking.bookingStatus ===
                    "rejected" && (
                    <div className="admin-booking-rejected-note">
                      <XCircle size={17} />
                      Reservation rejected
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

export default AdminBookings;