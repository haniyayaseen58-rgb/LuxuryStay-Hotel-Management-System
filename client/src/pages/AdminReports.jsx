import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Hotel,
  LoaderCircle,
  RefreshCw,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import API_BASE_URL from "../config/api";
import "./AdminReports.css";

function AdminReports() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const formatMoney = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchReports = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/reports/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load reports."
        );
      }

      setReport(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const monthlyPerformance =
    report?.monthlyPerformance || [];

  const roomPerformance =
    report?.roomPerformance || [];

  const maxRevenue = useMemo(() => {
    return Math.max(
      ...monthlyPerformance.map((item) =>
        Number(item.revenue || 0)
      ),
      1
    );
  }, [monthlyPerformance]);

  const maxRoomRevenue = useMemo(() => {
    return Math.max(
      ...roomPerformance.map((room) =>
        Number(room.revenue || 0)
      ),
      1
    );
  }, [roomPerformance]);

  if (loading) {
    return (
      <main className="reports-page">
        <div className="reports-loading">
          <LoaderCircle
            size={42}
            className="reports-spin"
          />
          <h2>Generating hotel intelligence...</h2>
          <p>
            LuxuryStay is analysing live booking and
            financial records.
          </p>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="reports-page">
        <div className="reports-error">
          <BarChart3 size={45} />
          <h2>Reports could not be loaded</h2>
          <p>
            {error ||
              "Unable to generate hotel reports."}
          </p>
          <button
            type="button"
            onClick={() => fetchReports()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const summary = report.summary || {};
  const statuses = report.statusBreakdown || {};
  const payments = report.paymentBreakdown || {};
  const recentActivity = report.recentActivity || [];

  const collectionRate =
    Number(summary.totalBilled || 0) > 0
      ? Math.min(
          Math.round(
            (Number(summary.totalRevenue || 0) /
              Number(summary.totalBilled || 0)) *
              100
          ),
          100
        )
      : 0;

  const totalPaymentFolios =
    Number(payments.paid || 0) +
    Number(payments.partial || 0) +
    Number(payments.unpaid || 0);

  return (
    <main className="reports-page">
      <div className="reports-orb reports-orb-one"></div>
      <div className="reports-orb reports-orb-two"></div>
      <div className="reports-orb reports-orb-three"></div>

      <div className="reports-shell">
        <header className="reports-topbar reports-enter">
          <button
            type="button"
            className="reports-back"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={18} />
            <span>Control Center</span>
          </button>

          <div className="reports-brand">
            <div>
              <Hotel size={21} />
            </div>

            <span>
              <strong>LuxuryStay</strong>
              Intelligence Bureau
            </span>
          </div>

          <button
            type="button"
            className="reports-refresh"
            onClick={() => fetchReports(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "reports-spin" : ""
              }
            />
            {refreshing ? "Analysing" : "Refresh Data"}
          </button>
        </header>

        <section className="reports-hero">
          <div className="reports-hero-copy reports-hero-enter">
            <span className="reports-kicker">
              LIVE PROPERTY INTELLIGENCE
            </span>

            <h1>
              Numbers that tell the
              <em> hotel story.</em>
            </h1>

            <p>
              A live analytical view of bookings,
              occupancy, collections and room
              performance across LuxuryStay.
            </p>

            <div className="reports-generated">
              <Clock3 size={15} />
              Report generated{" "}
              {formatDate(report.generatedAt)}
            </div>
          </div>

          <div className="reports-score-card reports-score-enter">
            <span>COLLECTION PERFORMANCE</span>

            <div
              className="reports-score-ring"
              style={{
                "--score": `${collectionRate * 3.6}deg`,
              }}
            >
              <div className="reports-ring-center">
                <div className="reports-ring-logo">
                  LS
                </div>
              </div>
            </div>

            <div className="reports-collection-rate">
              <strong>{collectionRate}%</strong>
              <span>Collection Rate</span>
            </div>

            <div className="reports-collection-money">
              <strong>
                {formatMoney(summary.totalRevenue)}
              </strong>
              <span>
                collected from{" "}
                {formatMoney(summary.totalBilled)}
              </span>
            </div>
          </div>
        </section>

        <section className="reports-summary-grid">
          <article
            className="reports-summary-card reports-card-enter"
            style={{ "--delay": "0.05s" }}
          >
            <div className="reports-card-icon">
              <CalendarCheck size={22} />
            </div>

            <span>Total Bookings</span>
            <strong>{summary.totalBookings || 0}</strong>
            <small>
              {summary.billableBookings || 0} active
              billable stays
            </small>
          </article>

          <article
            className="reports-summary-card reports-card-enter"
            style={{ "--delay": "0.12s" }}
          >
            <div className="reports-card-icon">
              <BedDouble size={22} />
            </div>

            <span>Active Rooms</span>
            <strong>{summary.totalRooms || 0}</strong>
            <small>
              {summary.availableRooms || 0} currently
              available
            </small>
          </article>

          <article
            className="reports-summary-card reports-card-enter"
            style={{ "--delay": "0.19s" }}
          >
            <div className="reports-card-icon">
              <TrendingUp size={22} />
            </div>

            <span>Occupancy Rate</span>
            <strong>
              {summary.occupancyRate || 0}%
            </strong>
            <small>
              {summary.occupiedRooms || 0} rooms occupied
            </small>
          </article>

          <article
            className="reports-summary-card reports-revenue-card reports-card-enter"
            style={{ "--delay": "0.26s" }}
          >
            <div className="reports-card-icon reports-pkr-icon">
              <span>PKR</span>
            </div>

            <span>Revenue Collected</span>
            <strong>
              {formatMoney(summary.totalRevenue)}
            </strong>
            <small>
              {formatMoney(summary.totalOutstanding)}{" "}
              outstanding
            </small>
          </article>
        </section>

        <section className="reports-main-grid">
          <article className="reports-panel revenue-panel reports-panel-enter">
            <div className="reports-panel-heading">
              <div>
                <span>REVENUE TIMELINE</span>
                <h2>Monthly Performance</h2>
              </div>

              <BarChart3 size={25} />
            </div>

            {monthlyPerformance.length === 0 ? (
              <div className="reports-no-data">
                No monthly records available yet.
              </div>
            ) : (
              <div className="revenue-chart">
                {monthlyPerformance.map(
                  (month, index) => {
                    const height = Math.max(
                      (Number(month.revenue || 0) /
                        maxRevenue) *
                        100,
                      month.revenue > 0 ? 8 : 2
                    );

                    return (
                      <div
                        className="revenue-column"
                        key={month.key}
                      >
                        <div className="revenue-value">
                          {formatMoney(month.revenue)}
                        </div>

                        <div className="revenue-bar-space">
                          <div
                            className="revenue-bar"
                            style={{
                              height: `${height}%`,
                              "--bar-delay": `${index * 0.12}s`,
                            }}
                          ></div>
                        </div>

                        <strong>{month.label}</strong>

                        <small>
                          {month.bookings} booking
                          {month.bookings === 1
                            ? ""
                            : "s"}
                        </small>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </article>

          <article className="reports-panel occupancy-panel-report reports-panel-enter reports-panel-delay">
            <div className="reports-panel-heading">
              <div>
                <span>PROPERTY PULSE</span>
                <h2>Room Distribution</h2>
              </div>

              <BedDouble size={24} />
            </div>

            <div
              className="reports-occupancy-ring"
              style={{
                "--occupancy": `${
                  Number(summary.occupancyRate || 0) *
                  3.6
                }deg`,
              }}
            >
              <div>
                <strong>
                  {summary.occupancyRate || 0}%
                </strong>
                <span>Occupied</span>
              </div>
            </div>

            <div className="reports-room-status">
              <div>
                <i className="occupied"></i>
                <span>Occupied</span>
                <strong>
                  {summary.occupiedRooms || 0}
                </strong>
              </div>

              <div>
                <i className="available"></i>
                <span>Available</span>
                <strong>
                  {summary.availableRooms || 0}
                </strong>
              </div>

              <div>
                <i className="service"></i>
                <span>Service</span>
                <strong>
                  {summary.serviceRooms || 0}
                </strong>
              </div>
            </div>
          </article>
        </section>

        <section className="reports-breakdown-grid">
          <article className="reports-panel reports-panel-enter">
            <div className="reports-panel-heading">
              <div>
                <span>RESERVATION FLOW</span>
                <h2>Booking Status</h2>
              </div>

              <CalendarCheck size={24} />
            </div>

            <div className="status-report-grid">
              <div>
                <span>Pending</span>
                <strong>{statuses.pending || 0}</strong>
              </div>

              <div>
                <span>Confirmed</span>
                <strong>
                  {statuses.confirmed || 0}
                </strong>
              </div>

              <div>
                <span>Checked In</span>
                <strong>
                  {statuses.checkedIn || 0}
                </strong>
              </div>

              <div>
                <span>Checked Out</span>
                <strong>
                  {statuses.checkedOut || 0}
                </strong>
              </div>

              <div>
                <span>Rejected</span>
                <strong>
                  {statuses.rejected || 0}
                </strong>
              </div>

              <div>
                <span>Cancelled</span>
                <strong>
                  {statuses.cancelled || 0}
                </strong>
              </div>
            </div>
          </article>

          <article className="reports-panel reports-panel-enter reports-panel-delay">
            <div className="reports-panel-heading">
              <div>
                <span>PAYMENT HEALTH</span>
                <h2>Folio Settlement</h2>
              </div>

              <WalletCards size={24} />
            </div>

            <div className="payment-report">
              <div className="payment-report-total">
                <strong>{totalPaymentFolios}</strong>
                <span>ACTIVE FOLIOS</span>
              </div>

              <div className="payment-report-lines">
                <div>
                  <span>
                    <i className="paid"></i>
                    Paid
                  </span>
                  <strong>{payments.paid || 0}</strong>
                </div>

                <div>
                  <span>
                    <i className="partial"></i>
                    Partial
                  </span>
                  <strong>
                    {payments.partial || 0}
                  </strong>
                </div>

                <div>
                  <span>
                    <i className="unpaid"></i>
                    Unpaid
                  </span>
                  <strong>
                    {payments.unpaid || 0}
                  </strong>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="reports-bottom-grid">
          <article className="reports-panel reports-panel-enter">
            <div className="reports-panel-heading">
              <div>
                <span>ROOM INTELLIGENCE</span>
                <h2>Room Performance</h2>
              </div>

              <TrendingUp size={24} />
            </div>

            {roomPerformance.length === 0 ? (
              <div className="reports-no-data">
                No room performance data available.
              </div>
            ) : (
              <div className="room-performance-list">
                {roomPerformance
                  .slice(0, 6)
                  .map((room, index) => {
                    const width = Math.max(
                      (Number(room.revenue || 0) /
                        maxRoomRevenue) *
                        100,
                      3
                    );

                    return (
                      <div
                        className="room-performance-row"
                        key={room.roomId}
                      >
                        <div className="room-rank">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="room-performance-info">
                          <div>
                            <span>
                              Room {room.roomNumber}
                            </span>

                            <strong>
                              {formatMoney(
                                room.revenue
                              )}
                            </strong>
                          </div>

                          <small>
                            {room.roomName} ·{" "}
                            {room.bookings} booking
                            {room.bookings === 1
                              ? ""
                              : "s"}
                          </small>

                          <div className="room-performance-track">
                            <span
                              style={{
                                width: `${width}%`,
                              }}
                            ></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </article>

          <article className="reports-panel reports-panel-enter reports-panel-delay">
            <div className="reports-panel-heading">
              <div>
                <span>RECENT MOVEMENT</span>
                <h2>Booking Activity</h2>
              </div>

              <Clock3 size={24} />
            </div>

            {recentActivity.length === 0 ? (
              <div className="reports-no-data">
                No booking activity available.
              </div>
            ) : (
              <div className="reports-activity-list">
                {recentActivity.map((activity) => (
                  <div
                    className="reports-activity"
                    key={activity.id}
                  >
                    <div className="activity-icon">
                      {activity.paymentStatus ===
                      "paid" ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <CalendarCheck size={18} />
                      )}
                    </div>

                    <div>
                      <strong>
                        {activity.guestName}
                      </strong>

                      <span>
                        Room {activity.roomNumber} ·{" "}
                        {activity.bookingStatus}
                      </span>
                    </div>

                    <div className="activity-amount">
                      <strong>
                        {formatMoney(
                          activity.totalAmount
                        )}
                      </strong>

                      <span>
                        {activity.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}

export default AdminReports;