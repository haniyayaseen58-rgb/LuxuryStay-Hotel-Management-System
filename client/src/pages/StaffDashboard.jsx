import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  LogIn,
  LogOut,
  Sparkles,
  Wrench,
  Users,
  Bell,
  Search,
  Hotel,
  ClipboardCheck,
  DoorOpen,
  ArrowUpRight,
  RefreshCw,
  Clock3,
  UserRound,
} from "lucide-react";

import API_BASE_URL from "../config/api";
import "./StaffDashboard.css";

function StaffDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [bookingsResponse, roomsResponse, maintenanceResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/bookings/staff`, {
            headers,
          }),
          fetch(`${API_BASE_URL}/api/rooms`, {
            headers,
          }),
          fetch(`${API_BASE_URL}/api/maintenance`, {
            headers,
          }),
        ]);

      const bookingsData = await bookingsResponse.json();
      const roomsData = await roomsResponse.json();
      const maintenanceData = await maintenanceResponse.json();

      if (
        !bookingsResponse.ok ||
        !roomsResponse.ok ||
        !maintenanceResponse.ok
      ) {
        throw new Error(
          bookingsData.message ||
            roomsData.message ||
            maintenanceData.message ||
            "Unable to load dashboard data."
        );
      }

      setBookings(
        Array.isArray(bookingsData)
          ? bookingsData
          : bookingsData.bookings || []
      );

      setRooms(
        Array.isArray(roomsData)
          ? roomsData
          : roomsData.rooms || []
      );

      setMaintenanceTasks(
        Array.isArray(maintenanceData)
          ? maintenanceData
          : maintenanceData.tasks || []
      );
    } catch (error) {
      console.error("Staff Dashboard Error:", error);
      setError(
        error.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const isToday = (date) => {
    if (!date) {
      return false;
    }

    const value = new Date(date);
    const today = new Date();

    return (
      value.getFullYear() === today.getFullYear() &&
      value.getMonth() === today.getMonth() &&
      value.getDate() === today.getDate()
    );
  };

  const todayCheckIns = useMemo(() => {
    return bookings.filter(
      (booking) =>
        booking.checkedInAt &&
        isToday(booking.checkedInAt)
    ).length;
  }, [bookings]);

  const todayCheckOuts = useMemo(() => {
    return bookings.filter(
      (booking) =>
        booking.checkedOutAt &&
        isToday(booking.checkedOutAt)
    ).length;
  }, [bookings]);

  const activeRooms = useMemo(() => {
    return rooms.filter(
      (room) => room.isActive !== false
    );
  }, [rooms]);

  const availableRooms = activeRooms.filter(
    (room) => room.status === "available"
  ).length;

  const occupiedRooms = activeRooms.filter(
    (room) => room.status === "occupied"
  ).length;

  const cleaningRooms = activeRooms.filter(
    (room) => room.status === "cleaning"
  ).length;

  const maintenanceRooms = activeRooms.filter(
    (room) => room.status === "maintenance"
  ).length;

  const reservedRooms = activeRooms.filter(
    (room) => room.status === "reserved"
  ).length;

  const serviceTasks = maintenanceTasks.filter(
    (task) =>
      task.status === "pending" ||
      task.status === "in-progress"
  ).length;

  const totalRooms = activeRooms.length;

  const getPercentage = (count) => {
    if (!totalRooms) {
      return 0;
    }

    return Math.round((count / totalRooms) * 100);
  };

  const occupiedPercentage =
    getPercentage(occupiedRooms);

  const availablePercentage =
    getPercentage(availableRooms);

  const cleaningPercentage =
    getPercentage(cleaningRooms);

  const upcomingArrivals = useMemo(() => {
    const now = new Date();

    now.setHours(0, 0, 0, 0);

    return bookings
      .filter((booking) => {
        if (booking.bookingStatus !== "confirmed") {
          return false;
        }

        const checkIn = new Date(
          booking.checkInDate
        );

        checkIn.setHours(0, 0, 0, 0);

        return checkIn >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.checkInDate) -
          new Date(b.checkInDate)
      )
      .slice(0, 4);
  }, [bookings]);

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-PK",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }
    );
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim().toLowerCase();

    if (!value) {
      return;
    }

    const foundBooking = bookings.find(
      (booking) => {
        const guestName =
          booking.guestDetails?.fullName ||
          booking.guest?.name ||
          "";

        const email =
          booking.guestDetails?.email ||
          booking.guest?.email ||
          "";

        const phone =
          booking.guestDetails?.phone || "";

        const roomNumber =
          booking.room?.roomNumber || "";

        return [
          guestName,
          email,
          phone,
          roomNumber,
        ].some((item) =>
          String(item)
            .toLowerCase()
            .includes(value)
        );
      }
    );

    if (foundBooking) {
      navigate("/staff/bookings");
    }
  };

  return (
    <div className="staff-dashboard">
      <div className="staff-dashboard-bg">
        <span className="staff-circle staff-circle-one"></span>
        <span className="staff-circle staff-circle-two"></span>
        <span className="staff-circle staff-circle-three"></span>
      </div>

      <aside className="staff-sidebar">
        <div className="staff-logo">
          <div className="staff-logo-icon">
            <Hotel size={24} />
          </div>

          <div>
            <h2>LuxuryStay</h2>
            <span>Manager Portal</span>
          </div>
        </div>

        <nav className="staff-menu">
          <button className="staff-menu-item active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button
            className="staff-menu-item"
            onClick={() =>
              navigate("/staff/bookings")
            }
          >
            <CalendarCheck size={20} />
            <span>Bookings</span>
          </button>

          <button
            className="staff-menu-item"
            onClick={() =>
              navigate("/staff/check-in")
            }
          >
            <LogIn size={20} />
            <span>Check-In</span>
          </button>

          <button
            className="staff-menu-item"
            onClick={() =>
              navigate("/staff/check-out")
            }
          >
            <DoorOpen size={20} />
            <span>Check-Out</span>
          </button>

          <button
            className="staff-menu-item"
            onClick={() =>
              navigate("/staff/rooms")
            }
          >
            <BedDouble size={20} />
            <span>Room Status</span>
          </button>

          <button
            className="staff-menu-item"
            onClick={() =>
              navigate("/staff/housekeeping")
            }
          >
            <Sparkles size={20} />
            <span>Housekeeping</span>
          </button>

          <button
            className="staff-menu-item"
            onClick={() =>
              navigate("/staff/maintenance")
            }
          >
            <Wrench size={20} />
            <span>Maintenance</span>
          </button>

          <button
            className="staff-menu-item"
            onClick={() =>
              navigate("/staff/guests")
            }
          >
            <Users size={20} />
            <span>Guests</span>
          </button>
        </nav>

        <button
          className="staff-logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="staff-main">
        <header className="staff-header">
          <div>
            <p className="staff-dashboard-label">
              MANAGER OVERVIEW
            </p>

            <h1>
              Welcome back,{" "}
              <span>{user?.name || "Manager"}</span>
            </h1>

            <p>
              Live hotel operations and guest activity
              from one place.
            </p>
          </div>

          <div className="staff-header-actions">
            <form
              className="staff-search"
              onSubmit={handleSearch}
            >
              <Search size={18} />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search bookings..."
              />
            </form>

            <button
              className="staff-notification"
              type="button"
              onClick={fetchDashboardData}
              title="Refresh dashboard"
            >
              {loading ? (
                <RefreshCw
                  size={20}
                  className="staff-dashboard-spin"
                />
              ) : (
                <Bell size={20} />
              )}

              {serviceTasks > 0 && <span></span>}
            </button>

            <div className="staff-profile">
              <div className="staff-avatar">
                {user?.name
                  ?.charAt(0)
                  .toUpperCase() || "M"}
              </div>

              <div>
                <strong>
                  {user?.name || "Manager"}
                </strong>
                <span>Hotel Manager</span>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="staff-dashboard-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchDashboardData}
            >
              Try Again
            </button>
          </div>
        )}

        <section className="staff-stats-grid">
          <div className="staff-stat-card">
            <div className="staff-stat-top">
              <div className="staff-stat-icon">
                <LogIn size={22} />
              </div>

              <span className="staff-stat-badge">
                Today
                <ArrowUpRight size={13} />
              </span>
            </div>

            <h3>
              {loading ? "..." : todayCheckIns}
            </h3>
            <p>Today's Check-Ins</p>
          </div>

          <div className="staff-stat-card">
            <div className="staff-stat-top">
              <div className="staff-stat-icon">
                <DoorOpen size={22} />
              </div>

              <span className="staff-stat-badge">
                Today
                <ArrowUpRight size={13} />
              </span>
            </div>

            <h3>
              {loading ? "..." : todayCheckOuts}
            </h3>
            <p>Today's Check-Outs</p>
          </div>

          <div className="staff-stat-card">
            <div className="staff-stat-top">
              <div className="staff-stat-icon">
                <BedDouble size={22} />
              </div>

              <span className="staff-stat-badge">
                Live
              </span>
            </div>

            <h3>
              {loading ? "..." : availableRooms}
            </h3>
            <p>Available Rooms</p>
          </div>

          <div className="staff-stat-card staff-stat-featured">
            <div className="staff-stat-top">
              <div className="staff-stat-icon">
                <ClipboardCheck size={22} />
              </div>

              <span className="staff-stat-badge">
                Active
              </span>
            </div>

            <h3>
              {loading ? "..." : serviceTasks}
            </h3>
            <p>Service Tasks</p>
          </div>
        </section>

        <section className="staff-content-grid">
          <div className="staff-arrivals-panel">
            <div className="staff-panel-heading">
              <div>
                <span>ARRIVAL SCHEDULE</span>
                <h2>Upcoming Arrivals</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/staff/bookings")
                }
              >
                View Bookings
              </button>
            </div>

            <div className="arrival-list">
              {loading ? (
                <div className="no-arrivals">
                  <RefreshCw
                    size={30}
                    className="staff-dashboard-spin"
                  />

                  <strong>
                    Loading arrivals...
                  </strong>
                </div>
              ) : upcomingArrivals.length === 0 ? (
                <div className="no-arrivals">
                  <div className="no-arrivals-icon">
                    <CalendarCheck size={30} />
                  </div>

                  <span className="no-arrivals-label">
                    ARRIVAL DESK
                  </span>

                  <strong>
                    No upcoming arrivals
                  </strong>

                  <p>
                    Confirmed future guest arrivals
                    will automatically appear here.
                  </p>

                  <div className="no-arrivals-status">
                    <span></span>
                    Schedule is clear
                  </div>
                </div>
              ) : (
                upcomingArrivals.map(
                  (booking) => (
                    <div
                      className="staff-arrival-card"
                      key={booking._id}
                    >
                      <div className="staff-arrival-avatar">
                        {(booking.guestDetails
                          ?.fullName ||
                          booking.guest?.name ||
                          "G")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="staff-arrival-info">
                        <strong>
                          {booking.guestDetails
                            ?.fullName ||
                            booking.guest?.name ||
                            "Guest"}
                        </strong>

                        <span>
                          <UserRound size={13} />
                          {booking.numberOfGuests}{" "}
                          guest
                          {booking.numberOfGuests !==
                          1
                            ? "s"
                            : ""}
                        </span>
                      </div>

                      <div className="staff-arrival-room">
                        <span>ROOM</span>
                        <strong>
                          {booking.room
                            ?.roomNumber ||
                            "—"}
                        </strong>
                      </div>

                      <div className="staff-arrival-date">
                        <Clock3 size={15} />

                        <div>
                          <span>Check-In</span>
                          <strong>
                            {formatDate(
                              booking.checkInDate
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          <div className="staff-room-panel">
            <span className="staff-panel-mini-title">
              LIVE STATUS
            </span>

            <h2>Rooms Overview</h2>

            <div className="staff-room-summary">
              <div>
                <strong>
                  {loading ? "..." : occupiedRooms}
                </strong>
                <span>Occupied</span>
              </div>

              <div>
                <strong>
                  {loading ? "..." : availableRooms}
                </strong>
                <span>Available</span>
              </div>

              <div>
                <strong>
                  {loading ? "..." : cleaningRooms}
                </strong>
                <span>Cleaning</span>
              </div>
            </div>

            <div className="staff-room-progress">
              <div className="room-progress-row">
                <div>
                  <span>Occupied</span>
                  <strong>
                    {occupiedPercentage}%
                  </strong>
                </div>

                <div className="room-progress-bar">
                  <span
                    style={{
                      width: `${occupiedPercentage}%`,
                    }}
                  ></span>
                </div>
              </div>

              <div className="room-progress-row">
                <div>
                  <span>Available</span>
                  <strong>
                    {availablePercentage}%
                  </strong>
                </div>

                <div className="room-progress-bar">
                  <span
                    style={{
                      width: `${availablePercentage}%`,
                    }}
                  ></span>
                </div>
              </div>

              <div className="room-progress-row">
                <div>
                  <span>Cleaning</span>
                  <strong>
                    {cleaningPercentage}%
                  </strong>
                </div>

                <div className="room-progress-bar">
                  <span
                    style={{
                      width: `${cleaningPercentage}%`,
                    }}
                  ></span>
                </div>
              </div>
            </div>

            <div className="room-empty-note">
              <BedDouble size={17} />

              <div>
                <strong>
                  {totalRooms} active rooms
                </strong>

                <span>
                  {maintenanceRooms} maintenance ·{" "}
                  {reservedRooms} reserved ·{" "}
                  {cleaningRooms} cleaning
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StaffDashboard;