import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Search,
  RefreshCw,
  UserRound,
  Mail,
  Phone,
  BedDouble,
  CalendarDays,
  ShieldCheck,
  BadgeCheck,
  Clock3,
  Hotel,
} from "lucide-react";

import "./StaffGuests.css";

function StaffGuests() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchGuests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/bookings/staff",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to load guest records."
        );
        return;
      }

      setBookings(
        Array.isArray(data) ? data : data.bookings || []
      );
    } catch (error) {
      console.error("Staff Guests Error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const guests = useMemo(() => {
    const guestMap = new Map();

    bookings.forEach((booking) => {
      const details = booking.guestDetails || {};
      const guestId =
        booking.guest?._id ||
        booking.guest ||
        details.email ||
        booking._id;

      const existing = guestMap.get(guestId);

      if (!existing) {
        guestMap.set(guestId, {
          id: guestId,
          name: details.fullName || "Guest",
          email:
            details.email ||
            booking.guest?.email ||
            "Not provided",
          phone: details.phone || "Not provided",
          nationality:
            details.nationality || "Not provided",
          documentType:
            details.documentType || "Not provided",
          documentNumber:
            details.documentNumber || "Not provided",
          room: booking.room,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          bookingStatus: booking.bookingStatus,
          verificationStatus:
            booking.verificationStatus,
          bookingCount: 1,
        });
      } else {
        existing.bookingCount += 1;

        if (
          new Date(booking.createdAt) >
          new Date(existing.createdAt || 0)
        ) {
          existing.room = booking.room;
          existing.checkInDate = booking.checkInDate;
          existing.checkOutDate = booking.checkOutDate;
          existing.bookingStatus =
            booking.bookingStatus;
          existing.verificationStatus =
            booking.verificationStatus;
          existing.createdAt = booking.createdAt;
        }
      }
    });

    return Array.from(guestMap.values());
  }, [bookings]);

  const filteredGuests = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return guests;
    }

    return guests.filter((guest) => {
      return [
        guest.name,
        guest.email,
        guest.phone,
        guest.documentNumber,
        guest.room?.roomNumber,
      ]
        .filter(Boolean)
        .some((item) =>
          String(item).toLowerCase().includes(value)
        );
    });
  }, [guests, search]);

  const verifiedGuests = guests.filter(
    (guest) =>
      guest.verificationStatus === "verified"
  ).length;

  const stayingGuests = guests.filter(
    (guest) =>
      guest.bookingStatus === "checked-in"
  ).length;

  const pendingGuests = guests.filter(
    (guest) =>
      guest.verificationStatus === "pending"
  ).length;

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  return (
    <main className="staff-guests-page">
      <div className="staff-guests-bg">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="staff-guests-container">
        <div className="staff-guests-topbar">
          <button
            type="button"
            className="guests-back-btn"
            onClick={() => navigate("/staff")}
          >
            <ArrowLeft size={18} />
            Back to Manager Dashboard
          </button>

          <button
            type="button"
            className="guests-refresh-btn"
            onClick={fetchGuests}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "spin" : ""}
            />
            Refresh
          </button>
        </div>

        <section className="staff-guests-hero">
          <div>
            <span className="guests-eyebrow">
              GUEST DIRECTORY
            </span>

            <h1>Hotel Guests</h1>

            <p>
              View guest information, reservation activity
              and verification status from one place.
            </p>
          </div>

          <div className="guests-hero-icon">
            <Hotel size={34} />
          </div>
        </section>

        <section className="guest-stats-grid">
          <div className="guest-stat-card">
            <div>
              <span>Total Guests</span>
              <strong>{guests.length}</strong>
            </div>
            <Users size={24} />
          </div>

          <div className="guest-stat-card">
            <div>
              <span>Currently Staying</span>
              <strong>{stayingGuests}</strong>
            </div>
            <BedDouble size={24} />
          </div>

          <div className="guest-stat-card">
            <div>
              <span>Verified Guests</span>
              <strong>{verifiedGuests}</strong>
            </div>
            <BadgeCheck size={24} />
          </div>

          <div className="guest-stat-card">
            <div>
              <span>Pending Verification</span>
              <strong>{pendingGuests}</strong>
            </div>
            <Clock3 size={24} />
          </div>
        </section>

        <section className="guest-directory-panel">
          <div className="guest-directory-heading">
            <div>
              <span>MANAGER RECORDS</span>
              <h2>Guest Directory</h2>
            </div>

            <div className="guest-search-box">
              <Search size={18} />
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search guest, phone, room..."
              />
            </div>
          </div>

          {error && (
            <div className="guest-error">{error}</div>
          )}

          {loading ? (
            <div className="guest-state">
              <RefreshCw className="spin" size={28} />
              <strong>Loading guests...</strong>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="guest-state">
              <Users size={34} />
              <strong>No guests found</strong>
              <span>
                Guest records will appear here from hotel
                bookings.
              </span>
            </div>
          ) : (
            <div className="guest-card-grid">
              {filteredGuests.map((guest) => (
                <article
                  className="guest-record-card"
                  key={guest.id}
                >
                  <div className="guest-record-top">
                    <div className="guest-avatar">
                      {guest.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="guest-name-block">
                      <h3>{guest.name}</h3>
                      <span>
                        {guest.bookingCount} reservation
                        {guest.bookingCount !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                    <span
                      className={`guest-booking-status status-${guest.bookingStatus}`}
                    >
                      {formatStatus(
                        guest.bookingStatus
                      )}
                    </span>
                  </div>

                  <div className="guest-contact-list">
                    <div>
                      <Mail size={16} />
                      <span>{guest.email}</span>
                    </div>

                    <div>
                      <Phone size={16} />
                      <span>{guest.phone}</span>
                    </div>

                    <div>
                      <UserRound size={16} />
                      <span>
                        {guest.nationality}
                      </span>
                    </div>
                  </div>

                  <div className="guest-room-box">
                    <div>
                      <span>ROOM</span>
                      <strong>
                        {guest.room?.roomNumber
                          ? `Room ${guest.room.roomNumber}`
                          : "Not assigned"}
                      </strong>
                    </div>

                    <div>
                      <span>TYPE</span>
                      <strong>
                        {guest.room?.name ||
                          guest.room?.type ||
                          "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="guest-stay-dates">
                    <div>
                      <CalendarDays size={16} />
                      <span>
                        Check-In
                        <strong>
                          {formatDate(
                            guest.checkInDate
                          )}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <CalendarDays size={16} />
                      <span>
                        Check-Out
                        <strong>
                          {formatDate(
                            guest.checkOutDate
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="guest-verification">
                    <div>
                      <ShieldCheck size={17} />
                      <span>
                        {formatStatus(
                          guest.verificationStatus
                        )}{" "}
                        Verification
                      </span>
                    </div>

                    <span>
                      {String(
                        guest.documentType
                      ).toUpperCase()}
                    </span>
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

export default StaffGuests;