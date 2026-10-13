import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  WalletCards,
  MessageSquareText,
  LogOut,
  Bell,
  Search,
  ArrowUpRight,
  Hotel,
  BarChart3,
  RefreshCw,
  Clock3,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("user")) || {
    name: "LuxuryStay Admin",
  };

  const token = localStorage.getItem("token");

  const [reportData, setReportData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [reportsResponse, feedbackResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/reports/admin", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/api/feedback/admin", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const reports = await reportsResponse.json();
      const feedback = await feedbackResponse.json();

      if (!reportsResponse.ok) {
        throw new Error(
          reports.message || "Unable to load dashboard data."
        );
      }

      if (!feedbackResponse.ok) {
        throw new Error(
          feedback.message || "Unable to load feedback data."
        );
      }

      setReportData(reports);
      setFeedbackData(feedback);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = reportData?.summary || {
    totalBookings: 0,
    billableBookings: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    serviceRooms: 0,
    occupancyRate: 0,
    totalBilled: 0,
    totalRevenue: 0,
    totalOutstanding: 0,
  };

  const statusBreakdown = reportData?.statusBreakdown || {
    pending: 0,
    confirmed: 0,
    checkedIn: 0,
    checkedOut: 0,
    rejected: 0,
    cancelled: 0,
  };

  const feedbackSummary = feedbackData?.summary || {
    totalFeedback: 0,
    averageRating: 0,
    reviewed: 0,
    newFeedback: 0,
    fiveStar: 0,
  };

  const monthlyPerformance =
    reportData?.monthlyPerformance || [];

  const recentActivity =
    reportData?.recentActivity || [];

  const activeBookings =
    Number(statusBreakdown.confirmed || 0) +
    Number(statusBreakdown.checkedIn || 0);

  const registeredGuests = useMemo(() => {
    const names = new Set();

    recentActivity.forEach((item) => {
      if (item.guestName) {
        names.add(item.guestName.toLowerCase());
      }
    });

    return names.size;
  }, [recentActivity]);

  const collectionRate =
    Number(summary.totalBilled) > 0
      ? Math.round(
          (Number(summary.totalRevenue) /
            Number(summary.totalBilled)) *
            100
        )
      : 0;

  const maxMonthlyValue = Math.max(
    ...monthlyPerformance.map((item) =>
      Number(item.revenue || 0)
    ),
    1
  );

  const chartData =
    monthlyPerformance.length > 0
      ? monthlyPerformance.slice(-7)
      : [];

  const filteredActivity = recentActivity.filter((item) => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return true;
    }

    return (
      item.guestName?.toLowerCase().includes(value) ||
      String(item.roomNumber || "")
        .toLowerCase()
        .includes(value) ||
      item.bookingStatus?.toLowerCase().includes(value) ||
      item.paymentStatus?.toLowerCase().includes(value)
    );
  });

  const formatMoney = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString(
      "en-PK"
    )}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
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
      .replaceAll("-", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-bg">
        <span className="circle circle-one"></span>
        <span className="circle circle-two"></span>
        <span className="circle circle-three"></span>
        <span className="circle circle-four"></span>
      </div>

      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-icon">
            <Hotel size={24} />
          </div>

          <div>
            <h2>LuxuryStay</h2>
            <span>Hotel Management</span>
          </div>
        </div>

        <nav className="admin-menu">
          <button
            className="menu-item active"
            onClick={() => navigate("/admin")}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/admin/rooms")}
          >
            <BedDouble size={20} />
            <span>Room Management</span>
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate("/admin/bookings")
            }
          >
            <CalendarCheck size={20} />
            <span>Booking Management</span>
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate("/admin/create-staff")
            }
          >
            <Users size={20} />
            <span>Users & Staff</span>
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate("/admin/finance")
            }
          >
            <WalletCards size={20} />
            <span>Finance & Billing</span>
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate("/admin/reports")
            }
          >
            <BarChart3 size={20} />
            <span>Reports</span>
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate("/admin/feedback")
            }
          >
            <MessageSquareText size={20} />
            <span>Guest Feedback</span>

            {feedbackSummary.newFeedback > 0 && (
              <span className="admin-menu-badge">
                {feedbackSummary.newFeedback}
              </span>
            )}
          </button>
        </nav>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-label">
              LIVE ADMIN OVERVIEW
            </p>

            <h1>
              Welcome back,{" "}
              <span>{admin.name || "Admin"}</span>
            </h1>

            <p>
              Your LuxuryStay property is connected and
              reporting live operational data.
            </p>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search recent activity..."
              />
            </div>

            <button
              className="notification-btn"
              type="button"
              onClick={() =>
                navigate("/admin/feedback")
              }
            >
              <Bell size={20} />

              {feedbackSummary.newFeedback > 0 && (
                <span className="notification-dot"></span>
              )}
            </button>

            <button
              className="admin-refresh-button"
              type="button"
              onClick={loadDashboard}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={
                  loading ? "admin-refresh-spin" : ""
                }
              />
            </button>

            <div className="admin-profile">
              <div className="profile-avatar">
                {admin.name
                  ?.charAt(0)
                  .toUpperCase() || "A"}
              </div>

              <div>
                <strong>
                  {admin.name || "Admin"}
                </strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="admin-dashboard-error">
            {error}
          </div>
        )}

        {loading && !reportData ? (
          <div className="admin-dashboard-loading">
            <RefreshCw
              size={32}
              className="admin-refresh-spin"
            />
            <h3>Preparing your command center...</h3>
            <p>
              Live hotel operations are being loaded.
            </p>
          </div>
        ) : (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon">
                    <BedDouble />
                  </div>

                  <span className="stat-growth">
                    Live
                    <ArrowUpRight size={14} />
                  </span>
                </div>

                <h3>{summary.totalRooms}</h3>
                <p>Total Rooms</p>

                <div className="stat-progress">
                  <span
                    style={{
                      width:
                        summary.totalRooms > 0
                          ? "100%"
                          : "0%",
                    }}
                  ></span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon">
                    <CalendarCheck />
                  </div>

                  <span className="stat-growth">
                    Live
                    <ArrowUpRight size={14} />
                  </span>
                </div>

                <h3>{activeBookings}</h3>
                <p>Active Bookings</p>

                <div className="stat-progress">
                  <span
                    style={{
                      width: `${Math.min(
                        summary.totalBookings > 0
                          ? (activeBookings /
                              summary.totalBookings) *
                              100
                          : 0,
                        100
                      )}%`,
                    }}
                  ></span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon">
                    <MessageSquareText />
                  </div>

                  <span className="stat-growth">
                    {Number(
                      feedbackSummary.averageRating || 0
                    ).toFixed(1)}
                    /5
                    <ArrowUpRight size={14} />
                  </span>
                </div>

                <h3>
                  {feedbackSummary.totalFeedback}
                </h3>
                <p>Guest Feedback</p>

                <div className="stat-progress">
                  <span
                    style={{
                      width: `${Math.min(
                        (Number(
                          feedbackSummary.averageRating ||
                            0
                        ) /
                          5) *
                          100,
                        100
                      )}%`,
                    }}
                  ></span>
                </div>
              </div>

              <div className="stat-card featured-stat">
                <div className="stat-top">
                  <div className="stat-icon">
                    <WalletCards />
                  </div>

                  <span className="stat-growth">
                    {collectionRate}%
                    <TrendingUp size={14} />
                  </span>
                </div>

                <h3>
                  {formatMoney(summary.totalRevenue)}
                </h3>
                <p>Revenue Collected</p>

                <div className="stat-progress">
                  <span
                    style={{
                      width: `${Math.min(
                        collectionRate,
                        100
                      )}%`,
                    }}
                  ></span>
                </div>
              </div>
            </section>

            <section className="admin-live-strip">
              <div>
                <Clock3 size={18} />
                <span>
                  Pending Bookings
                  <strong>
                    {statusBreakdown.pending}
                  </strong>
                </span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>
                  Checked Out
                  <strong>
                    {statusBreakdown.checkedOut}
                  </strong>
                </span>
              </div>

              <div>
                <WalletCards size={18} />
                <span>
                  Outstanding
                  <strong>
                    {formatMoney(
                      summary.totalOutstanding
                    )}
                  </strong>
                </span>
              </div>

              <div>
                <MessageSquareText size={18} />
                <span>
                  New Feedback
                  <strong>
                    {feedbackSummary.newFeedback}
                  </strong>
                </span>
              </div>
            </section>

            <section className="dashboard-content-grid">
              <div className="overview-panel">
                <div className="panel-heading">
                  <div>
                    <span>
                      LIVE PERFORMANCE
                    </span>
                    <h2>Revenue Pulse</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/admin/reports")
                    }
                  >
                    View Reports
                  </button>
                </div>

                {chartData.length === 0 ? (
                  <div className="admin-empty-chart">
                    <BarChart3 size={32} />
                    <strong>
                      No performance data yet
                    </strong>
                    <span>
                      Monthly revenue will appear here.
                    </span>
                  </div>
                ) : (
                  <div className="admin-live-chart">
                    {chartData.map((item) => {
                      const height = Math.max(
                        (Number(item.revenue || 0) /
                          maxMonthlyValue) *
                          100,
                        Number(item.revenue || 0) > 0
                          ? 12
                          : 4
                      );

                      return (
                        <div
                          className="admin-chart-column"
                          key={item.key}
                        >
                          <div className="admin-chart-value">
                            {formatMoney(item.revenue)}
                          </div>

                          <div className="admin-chart-track">
                            <span
                              style={{
                                height: `${height}%`,
                              }}
                            ></span>
                          </div>

                          <strong>{item.label}</strong>
                          <small>
                            {item.bookings} bookings
                          </small>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="occupancy-panel">
                <span className="panel-mini-title">
                  LIVE PROPERTY STATUS
                </span>

                <h2>Room Occupancy</h2>

                <div
                  className="occupancy-circle"
                  style={{
                    background: `conic-gradient(
                      #401d30 0deg ${
                        summary.occupancyRate * 3.6
                      }deg,
                      #eadbd6 ${
                        summary.occupancyRate * 3.6
                      }deg 360deg
                    )`,
                  }}
                >
                  <div className="occupancy-inner">
                    <strong>
                      {summary.occupancyRate}%
                    </strong>
                    <span>Occupied</span>
                  </div>
                </div>

                <div className="room-status-list">
                  <div>
                    <span className="status-dot occupied"></span>
                    Occupied
                    <strong>
                      {summary.occupiedRooms}
                    </strong>
                  </div>

                  <div>
                    <span className="status-dot available"></span>
                    Available
                    <strong>
                      {summary.availableRooms}
                    </strong>
                  </div>

                  <div>
                    <span className="status-dot cleaning"></span>
                    Service
                    <strong>
                      {summary.serviceRooms}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-activity-panel">
              <div className="panel-heading">
                <div>
                  <span>
                    OPERATIONAL TIMELINE
                  </span>
                  <h2>Recent Activity</h2>
                </div>

                <span className="admin-activity-count">
                  {filteredActivity.length} records
                </span>
              </div>

              {filteredActivity.length === 0 ? (
                <div className="admin-empty-activity">
                  <Search size={28} />
                  <strong>
                    No matching activity
                  </strong>
                  <span>
                    Try another search term.
                  </span>
                </div>
              ) : (
                <div className="admin-activity-list">
                  {filteredActivity.map((item) => (
                    <div
                      className="admin-activity-row"
                      key={item.id}
                    >
                      <div className="admin-activity-avatar">
                        {item.guestName
                          ?.charAt(0)
                          .toUpperCase() || "G"}
                      </div>

                      <div className="admin-activity-guest">
                        <strong>
                          {item.guestName || "Guest"}
                        </strong>

                        <span>
                          Room{" "}
                          {item.roomNumber || "N/A"} ·{" "}
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <div className="admin-activity-status">
                        <span
                          className={`admin-status-pill ${item.bookingStatus}`}
                        >
                          {formatStatus(
                            item.bookingStatus
                          )}
                        </span>
                      </div>

                      <div className="admin-activity-payment">
                        <span>
                          {formatStatus(
                            item.paymentStatus
                          )}
                        </span>

                        <strong>
                          {formatMoney(
                            item.amountPaid
                          )}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;