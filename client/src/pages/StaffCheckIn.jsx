import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LogIn,
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
  Sparkles,
  Search,
  CreditCard,
} from "lucide-react";

import API_BASE_URL from "../config/api";
import "./StaffCheckIn.css";

function StaffCheckIn() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("");
  const [search, setSearch] = useState("");

  const token =
    localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/staff`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to load arrivals."
        );
        setMessageType("error");
        return;
      }

      const confirmed =
        (data.bookings || []).filter(
          (booking) =>
            booking.bookingStatus ===
            "confirmed"
        );

      setBookings(confirmed);
    } catch (error) {
      console.error(
        "Check-In Arrivals Error:",
        error
      );

      setMessage(
        "Unable to connect to the server."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCheckIn = async (
    bookingId
  ) => {
    try {
      setActionLoading(bookingId);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/staff/${bookingId}/check-in`,
        {
          method: "PATCH",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to check in guest."
        );
        setMessageType("error");
        return;
      }

      setBookings((current) =>
        current.filter(
          (booking) =>
            booking._id !== bookingId
        )
      );

      setMessage(
        data.message ||
          "Guest checked in successfully!"
      );
      setMessageType("success");
    } catch (error) {
      console.error(
        "Guest Check-In Error:",
        error
      );

      setMessage(
        "Unable to connect to the server."
      );
      setMessageType("error");
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(
      date
    ).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }
    );
  };

  const filteredBookings =
    bookings.filter((booking) => {
      const query =
        search.toLowerCase().trim();

      if (!query) {
        return true;
      }

      const guestName =
        booking.guestDetails
          ?.fullName ||
        booking.guest?.name ||
        "";

      const email =
        booking.guestDetails?.email ||
        booking.guest?.email ||
        "";

      const phone =
        booking.guestDetails?.phone ||
        "";

      const roomNumber =
        booking.room?.roomNumber ||
        "";

      const documentNumber =
        booking.guestDetails
          ?.documentNumber || "";

      return [
        guestName,
        email,
        phone,
        roomNumber,
        documentNumber,
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(query)
      );
    });

  return (
    <main className="staff-checkin-page">
      <div className="staff-checkin-bg">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="staff-checkin-container">
        <button
          type="button"
          className="staff-checkin-back"
          onClick={() =>
            navigate("/staff")
          }
        >
          <ArrowLeft size={18} />
          Back to Manager Dashboard
        </button>

        <section className="staff-checkin-hero">
          <div className="staff-checkin-hero-copy">
            <span className="staff-checkin-eyebrow">
              ARRIVAL CONTROL
            </span>

            <h1>
              Guest Check-In
            </h1>

            <p>
              Verify confirmed arrivals,
              review guest identity and room
              details, then complete check-in
              from one secure workspace.
            </p>
          </div>

          <div className="staff-checkin-hero-visual">
            <div className="staff-checkin-orbit orbit-one"></div>
            <div className="staff-checkin-orbit orbit-two"></div>

            <div className="staff-checkin-hero-icon">
              <LogIn size={34} />
            </div>

            <span className="staff-checkin-live">
              <i></i>
              ARRIVAL DESK LIVE
            </span>
          </div>
        </section>

        <section className="staff-checkin-overview">
          <article>
            <div className="staff-checkin-overview-icon">
              <Hotel size={20} />
            </div>

            <div>
              <span>
                READY ARRIVALS
              </span>

              <strong>
                {bookings.length}
              </strong>
            </div>
          </article>

          <article>
            <div className="staff-checkin-overview-icon verified">
              <ShieldCheck size={20} />
            </div>

            <div>
              <span>
                VERIFIED
              </span>

              <strong>
                {
                  bookings.filter(
                    (booking) =>
                      booking.verificationStatus ===
                      "verified"
                  ).length
                }
              </strong>
            </div>
          </article>

          <article>
            <div className="staff-checkin-overview-icon today">
              <CalendarDays size={20} />
            </div>

            <div>
              <span>
                ARRIVAL QUEUE
              </span>

              <strong>
                {filteredBookings.length}
              </strong>
            </div>
          </article>
        </section>

        <section className="staff-checkin-workspace">
          <div className="staff-checkin-toolbar">
            <div>
              <span>
                CONFIRMED RESERVATIONS
              </span>

              <h2>
                Arrival Queue
              </h2>
            </div>

            <div className="staff-checkin-toolbar-actions">
              <label className="staff-checkin-search">
                <Search size={17} />

                <input
                  type="text"
                  placeholder="Guest, room, CNIC..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </label>

              <button
                type="button"
                className="staff-checkin-refresh"
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
              className={`staff-checkin-message ${messageType}`}
            >
              {messageType ===
              "success" ? (
                <CheckCircle2
                  size={18}
                />
              ) : (
                <Clock3 size={18} />
              )}

              <span>
                {message}
              </span>
            </div>
          )}

          {loading ? (
            <div className="staff-checkin-loading">
              <LoaderCircle size={34} />

              <strong>
                Preparing arrival desk...
              </strong>

              <span>
                Loading confirmed guest
                reservations.
              </span>
            </div>
          ) : filteredBookings.length ===
            0 ? (
            <div className="staff-checkin-empty">
              <div>
                <CheckCircle2
                  size={34}
                />
              </div>

              <strong>
                No arrivals waiting
              </strong>

              <span>
                Confirmed reservations ready
                for check-in will appear here.
              </span>
            </div>
          ) : (
            <div className="staff-checkin-grid">
              {filteredBookings.map(
                (booking) => (
                  <article
                    className="staff-arrival-card"
                    key={booking._id}
                  >
                    <div className="staff-arrival-card-head">
                      <div>
                        <span>
                          ARRIVAL
                        </span>

                        <strong>
                          #
                          {booking._id
                            ?.slice(-6)
                            .toUpperCase()}
                        </strong>
                      </div>

                      <div className="staff-arrival-ready">
                        <span></span>
                        READY
                      </div>
                    </div>

                    <div className="staff-arrival-guest">
                      <div className="staff-arrival-avatar">
                        <UserRound
                          size={24}
                        />
                      </div>

                      <div>
                        <span>
                          PRIMARY GUEST
                        </span>

                        <h3>
                          {booking
                            .guestDetails
                            ?.fullName ||
                            booking
                              .guest
                              ?.name ||
                            "Guest"}
                        </h3>

                        <p>
                          <Mail
                            size={13}
                          />

                          {booking
                            .guestDetails
                            ?.email ||
                            booking
                              .guest
                              ?.email ||
                            "—"}
                        </p>
                      </div>
                    </div>

                    <div className="staff-arrival-contact">
                      <div>
                        <Phone
                          size={15}
                        />

                        <span>
                          <small>
                            PHONE
                          </small>

                          <strong>
                            {booking
                              .guestDetails
                              ?.phone ||
                              "—"}
                          </strong>
                        </span>
                      </div>

                      <div>
                        <MapPin
                          size={15}
                        />

                        <span>
                          <small>
                            NATIONALITY
                          </small>

                          <strong>
                            {booking
                              .guestDetails
                              ?.nationality ||
                              "—"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="staff-arrival-room">
                      <div className="staff-arrival-room-icon">
                        <BedDouble
                          size={23}
                        />
                      </div>

                      <div>
                        <span>
                          ASSIGNED ROOM
                        </span>

                        <h4>
                          Room{" "}
                          {booking.room
                            ?.roomNumber ||
                            "—"}
                        </h4>

                        <p>
                          {booking.room
                            ?.name ||
                            "Room"}
                        </p>
                      </div>

                      <strong className="staff-arrival-room-type">
                        {booking.room
                          ?.type || "—"}
                      </strong>
                    </div>

                    <div className="staff-arrival-dates">
                      <div>
                        <CalendarDays
                          size={16}
                        />

                        <span>
                          <small>
                            ARRIVAL
                          </small>

                          <strong>
                            {formatDate(
                              booking.checkInDate
                            )}
                          </strong>
                        </span>
                      </div>

                      <div>
                        <CalendarDays
                          size={16}
                        />

                        <span>
                          <small>
                            DEPARTURE
                          </small>

                          <strong>
                            {formatDate(
                              booking.checkOutDate
                            )}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="staff-arrival-meta">
                      <span>
                        <Users
                          size={14}
                        />

                        {
                          booking.numberOfGuests
                        }{" "}
                        Guests
                      </span>

                      <span>
                        <Banknote
                          size={14}
                        />

                        Rs.{" "}
                        {Number(
                          booking.totalAmount ||
                            0
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="staff-arrival-verification">
                      <div>
                        <ShieldCheck
                          size={18}
                        />

                        <span>
                          <small>
                            IDENTITY STATUS
                          </small>

                          <strong>
                            Verified
                          </strong>
                        </span>
                      </div>

                      <div>
                        <CreditCard
                          size={18}
                        />

                        <span>
                          <small>
                            {booking
                              .guestDetails
                              ?.documentType ===
                            "passport"
                              ? "PASSPORT"
                              : "CNIC"}
                          </small>

                          <strong>
                            {booking
                              .guestDetails
                              ?.documentNumber ||
                              "—"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="staff-arrival-request">
                        <Sparkles
                          size={15}
                        />

                        <div>
                          <span>
                            SPECIAL REQUEST
                          </span>

                          <p>
                            {
                              booking.specialRequests
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      className="staff-arrival-checkin-btn"
                      disabled={
                        actionLoading ===
                        booking._id
                      }
                      onClick={() =>
                        handleCheckIn(
                          booking._id
                        )
                      }
                    >
                      {actionLoading ===
                      booking._id ? (
                        <>
                          <LoaderCircle
                            size={18}
                          />
                          Processing
                          Check-In...
                        </>
                      ) : (
                        <>
                          <LogIn
                            size={18}
                          />
                          Complete Guest
                          Check-In
                        </>
                      )}
                    </button>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default StaffCheckIn;