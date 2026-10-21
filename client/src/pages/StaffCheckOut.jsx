import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LogOut,
  RefreshCw,
  BedDouble,
  CalendarDays,
  UserRound,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Users,
  Banknote,
  CheckCircle2,
  LoaderCircle,
  Hotel,
  Clock3,
  Search,
  Sparkles,
} from "lucide-react";

import API_BASE_URL from "../config/api";
import "./StaffCheckOut.css";

function StaffCheckOut() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [search, setSearch] = useState("");

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
        setMessage(data.message || "Unable to load checked-in guests.");
        setMessageType("error");
        return;
      }

      const checkedInBookings = (data.bookings || []).filter(
        (booking) => booking.bookingStatus === "checked-in"
      );

      setBookings(checkedInBookings);
    } catch (error) {
      console.error("Staff Check-Out Bookings Error:", error);
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCheckOut = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/staff/${bookingId}/check-out`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to check out guest.");
        setMessageType("error");
        return;
      }

      setBookings((currentBookings) =>
        currentBookings.filter(
          (booking) => booking._id !== bookingId
        )
      );

      setMessage("Guest checked out successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Staff Check-Out Error:", error);
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    const guestName =
      booking.guestDetails?.fullName ||
      booking.guest?.name ||
      "";

    const email =
      booking.guestDetails?.email ||
      booking.guest?.email ||
      "";

    const phone = booking.guestDetails?.phone || "";
    const roomNumber = booking.room?.roomNumber || "";
    const documentNumber =
      booking.guestDetails?.documentNumber || "";

    return (
      guestName.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      phone.toLowerCase().includes(query) ||
      String(roomNumber).toLowerCase().includes(query) ||
      documentNumber.toLowerCase().includes(query)
    );
  });

  return (
    <main className="staff-checkout-page">
      <div className="staff-checkout-bg">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="staff-checkout-container">
        <button
          type="button"
          className="staff-checkout-back"
          onClick={() => navigate("/staff")}
        >
          <ArrowLeft size={18} />
          Back to Manager Dashboard
        </button>

        <section className="staff-checkout-hero">
          <div className="staff-checkout-hero-copy">
            <span className="staff-checkout-eyebrow">
              DEPARTURE DESK
            </span>

            <h1>Guest Check-Out</h1>

            <p>
              Complete active guest stays, record departures and
              automatically send rooms for housekeeping preparation.
            </p>

            <div className="staff-checkout-live">
              <span></span>
              ACTIVE DEPARTURE MANAGEMENT
            </div>
          </div>

          <div className="staff-checkout-hero-art">
            <div className="staff-checkout-orbit orbit-one"></div>
            <div className="staff-checkout-orbit orbit-two"></div>

            <div className="staff-checkout-hero-icon">
              <LogOut size={35} />
            </div>
          </div>
        </section>

        <section className="staff-checkout-overview">
          <article>
            <div className="staff-checkout-stat-icon">
              <Hotel size={21} />
            </div>

            <div>
              <strong>{bookings.length}</strong>
              <span>Active Stays</span>
            </div>
          </article>

          <article>
            <div className="staff-checkout-stat-icon">
              <ShieldCheck size={21} />
            </div>

            <div>
              <strong>
                {
                  bookings.filter(
                    (booking) =>
                      booking.verificationStatus === "verified"
                  ).length
                }
              </strong>
              <span>Verified Guests</span>
            </div>
          </article>

          <article>
            <div className="staff-checkout-stat-icon">
              <LogOut size={21} />
            </div>

            <div>
              <strong>{filteredBookings.length}</strong>
              <span>Departure Queue</span>
            </div>
          </article>
        </section>

        <section className="staff-checkout-workspace">
          <div className="staff-checkout-heading">
            <div>
              <span>ACTIVE GUEST STAYS</span>
              <h2>Departure Queue</h2>
            </div>

            <div className="staff-checkout-actions">
              <label className="staff-checkout-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search guest or room..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </label>

              <button
                type="button"
                className="staff-checkout-refresh"
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
              className={`staff-checkout-message ${messageType}`}
            >
              {messageType === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <Clock3 size={18} />
              )}

              <span>{message}</span>
            </div>
          )}

          {loading ? (
            <div className="staff-checkout-loading">
              <LoaderCircle size={36} />
              <strong>Loading active stays...</strong>
              <span>
                Getting checked-in guests from the hotel system.
              </span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="staff-checkout-empty">
              <div>
                <Sparkles size={34} />
              </div>

              <strong>No guests waiting for check-out</strong>

              <span>
                Checked-in guests will automatically appear here.
              </span>
            </div>
          ) : (
            <div className="staff-checkout-grid">
              {filteredBookings.map((booking) => (
                <article
                  className="staff-checkout-card"
                  key={booking._id}
                >
                  <div className="staff-checkout-card-top">
                    <div>
                      <span>ACTIVE STAY</span>
                      <strong>
                        #{booking._id?.slice(-6).toUpperCase()}
                      </strong>
                    </div>

                    <div className="staff-checkout-active-badge">
                      <span></span>
                      CHECKED-IN
                    </div>
                  </div>

                  <div className="staff-checkout-guest">
                    <div className="staff-checkout-avatar">
                      <UserRound size={24} />
                    </div>

                    <div>
                      <span>GUEST</span>

                      <h3>
                        {booking.guestDetails?.fullName ||
                          booking.guest?.name ||
                          "Guest"}
                      </h3>

                      <div className="staff-checkout-contact">
                        <span>
                          <Mail size={13} />
                          {booking.guestDetails?.email ||
                            booking.guest?.email ||
                            "—"}
                        </span>

                        <span>
                          <Phone size={13} />
                          {booking.guestDetails?.phone || "—"}
                        </span>

                        <span>
                          <MapPin size={13} />
                          {booking.guestDetails?.nationality ||
                            "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="staff-checkout-room">
                    <div className="staff-checkout-room-icon">
                      <BedDouble size={22} />
                    </div>

                    <div>
                      <span>
                        ROOM {booking.room?.roomNumber || "—"}
                      </span>

                      <h4>
                        {booking.room?.name || "Room unavailable"}
                      </h4>

                      <p>{booking.room?.type || "—"}</p>
                    </div>

                    <Hotel size={22} />
                  </div>

                  <div className="staff-checkout-dates">
                    <div>
                      <CalendarDays size={17} />

                      <span>
                        <small>ARRIVAL</small>
                        <strong>
                          {formatDate(booking.checkInDate)}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <CalendarDays size={17} />

                      <span>
                        <small>EXPECTED DEPARTURE</small>
                        <strong>
                          {formatDate(booking.checkOutDate)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="staff-checkout-meta">
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
                      <Clock3 size={15} />
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

                  <div className="staff-checkout-checkin-time">
                    <Clock3 size={16} />

                    <div>
                      <span>CHECKED-IN AT</span>
                      <strong>
                        {formatDateTime(booking.checkedInAt)}
                      </strong>
                    </div>
                  </div>

                  <div className="staff-checkout-verification">
                    <div>
                      <ShieldCheck size={16} />
                      <span>Identity Verification</span>
                    </div>

                    <strong>
                      {booking.verificationStatus === "verified"
                        ? "VERIFIED"
                        : booking.verificationStatus}
                    </strong>
                  </div>

                  {booking.specialRequests && (
                    <div className="staff-checkout-request">
                      <span>SPECIAL REQUEST</span>
                      <p>{booking.specialRequests}</p>
                    </div>
                  )}

                  <div className="staff-checkout-departure-note">
                    <LogOut size={18} />

                    <div>
                      <span>DEPARTURE PROCESS</span>
                      <strong>
                        Room will move to Cleaning after check-out
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="staff-checkout-button"
                    disabled={actionLoading === booking._id}
                    onClick={() =>
                      handleCheckOut(booking._id)
                    }
                  >
                    {actionLoading === booking._id ? (
                      <>
                        <LoaderCircle
                          className="staff-checkout-spinner"
                          size={18}
                        />
                        Processing Check-Out...
                      </>
                    ) : (
                      <>
                        <LogOut size={18} />
                        Complete Guest Check-Out
                      </>
                    )}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default StaffCheckOut;