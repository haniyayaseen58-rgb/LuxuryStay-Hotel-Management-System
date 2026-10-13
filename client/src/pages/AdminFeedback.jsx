import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MessageSquareText,
  RefreshCw,
  CheckCircle2,
  Clock3,
  Users,
  BedDouble,
  CalendarDays,
  Sparkles,
  Quote,
  Search,
  SlidersHorizontal,
  Mail,
} from "lucide-react";

import "./AdminFeedback.css";

function AdminFeedback() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [feedback, setFeedback] = useState([]);
  const [summary, setSummary] = useState({
    totalFeedback: 0,
    averageRating: 0,
    reviewed: 0,
    newFeedback: 0,
    fiveStar: 0,
  });
  const [ratingBreakdown, setRatingBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/feedback/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load guest feedback."
        );
      }

      setFeedback(data.feedback || []);
      setSummary(
        data.summary || {
          totalFeedback: 0,
          averageRating: 0,
          reviewed: 0,
          newFeedback: 0,
          fiveStar: 0,
        }
      );
      setRatingBreakdown(data.ratingBreakdown || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const markReviewed = async (feedbackId) => {
    try {
      setUpdatingId(feedbackId);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/feedback/admin/${feedbackId}/review`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update feedback."
        );
      }

      setFeedback((previous) =>
        previous.map((item) =>
          item._id === feedbackId
            ? {
                ...item,
                status: "reviewed",
              }
            : item
        )
      );

      setSummary((previous) => ({
        ...previous,
        reviewed: previous.reviewed + 1,
        newFeedback: Math.max(
          previous.newFeedback - 1,
          0
        ),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId("");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      const searchValue = search.trim().toLowerCase();

      const guestName =
        item.guest?.name?.toLowerCase() || "";
      const guestEmail =
        item.guest?.email?.toLowerCase() || "";
      const roomName =
        item.room?.name?.toLowerCase() || "";
      const roomNumber = String(
        item.room?.roomNumber || ""
      ).toLowerCase();
      const title =
        item.title?.toLowerCase() || "";
      const message =
        item.message?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        guestName.includes(searchValue) ||
        guestEmail.includes(searchValue) ||
        roomName.includes(searchValue) ||
        roomNumber.includes(searchValue) ||
        title.includes(searchValue) ||
        message.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      const matchesRating =
        ratingFilter === "all" ||
        Number(item.rating) === Number(ratingFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRating
      );
    });
  }, [
    feedback,
    search,
    statusFilter,
    ratingFilter,
  ]);

  const renderStars = (rating, size = 16) => {
    return (
      <div className="feedback-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={
              star <= Number(rating)
                ? "currentColor"
                : "transparent"
            }
            className={
              star <= Number(rating)
                ? "star-active"
                : "star-empty"
            }
          />
        ))}
      </div>
    );
  };

  const getRatingPercentage = (rating) => {
    const record = ratingBreakdown.find(
      (item) => Number(item.rating) === rating
    );

    if (!record || !summary.totalFeedback) {
      return 0;
    }

    return Math.round(
      (record.count / summary.totalFeedback) * 100
    );
  };

  const getRatingCount = (rating) => {
    const record = ratingBreakdown.find(
      (item) => Number(item.rating) === rating
    );

    return record?.count || 0;
  };

  return (
    <div className="admin-feedback-page">
      <div className="feedback-orb feedback-orb-one"></div>
      <div className="feedback-orb feedback-orb-two"></div>
      <div className="feedback-orb feedback-orb-three"></div>

      <div className="feedback-shell">
        <div className="feedback-topbar">
          <button
            type="button"
            className="feedback-back-btn"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <button
            type="button"
            className="feedback-refresh-btn"
            onClick={loadFeedback}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading ? "feedback-spin" : ""
              }
            />
            Refresh Voices
          </button>
        </div>

        <section className="feedback-hero">
          <div className="feedback-hero-copy">
            <div className="feedback-eyebrow">
              <Sparkles size={15} />
              GUEST EXPERIENCE JOURNAL
            </div>

            <h1>
              Every stay has
              <span> a story.</span>
            </h1>

            <p>
              Listen to your guests, understand their
              experience and turn every review into a
              better LuxuryStay journey.
            </p>

            <div className="feedback-hero-meta">
              <div>
                <MessageSquareText size={17} />
                <strong>{summary.totalFeedback}</strong>
                <span>Total Voices</span>
              </div>

              <div>
                <Star size={17} />
                <strong>
                  {Number(
                    summary.averageRating || 0
                  ).toFixed(1)}
                </strong>
                <span>Average Rating</span>
              </div>

              <div>
                <Clock3 size={17} />
                <strong>{summary.newFeedback}</strong>
                <span>Awaiting Review</span>
              </div>
            </div>
          </div>

          <div className="feedback-score-card">
            <span className="feedback-score-label">
              EXPERIENCE SCORE
            </span>

            <div className="feedback-score-ring">
              <div className="feedback-score-inner">
                <Star size={25} />
                <strong>
                  {Number(
                    summary.averageRating || 0
                  ).toFixed(1)}
                </strong>
                <span>OUT OF 5</span>
              </div>
            </div>

            <div className="feedback-score-stars">
              {renderStars(
                Math.round(summary.averageRating || 0),
                18
              )}
            </div>

            <p>
              Based on {summary.totalFeedback} guest{" "}
              {summary.totalFeedback === 1
                ? "experience"
                : "experiences"}
            </p>
          </div>
        </section>

        <section className="feedback-stat-grid">
          <div className="feedback-stat-card">
            <div className="feedback-stat-icon">
              <MessageSquareText size={21} />
            </div>
            <span>TOTAL FEEDBACK</span>
            <strong>{summary.totalFeedback}</strong>
            <p>Guest experiences collected</p>
          </div>

          <div className="feedback-stat-card">
            <div className="feedback-stat-icon">
              <Clock3 size={21} />
            </div>
            <span>NEW VOICES</span>
            <strong>{summary.newFeedback}</strong>
            <p>Waiting for admin review</p>
          </div>

          <div className="feedback-stat-card">
            <div className="feedback-stat-icon">
              <CheckCircle2 size={21} />
            </div>
            <span>REVIEWED</span>
            <strong>{summary.reviewed}</strong>
            <p>Experiences acknowledged</p>
          </div>

          <div className="feedback-stat-card feedback-stat-featured">
            <div className="feedback-stat-icon">
              <Star size={21} />
            </div>
            <span>FIVE STAR STAYS</span>
            <strong>{summary.fiveStar}</strong>
            <p>Exceptional guest experiences</p>
          </div>
        </section>

        <section className="feedback-insight-grid">
          <div className="feedback-rating-panel">
            <div className="feedback-section-heading">
              <div>
                <span>RATING DISTRIBUTION</span>
                <h2>Guest Sentiment</h2>
              </div>

              <Star size={23} />
            </div>

            <div className="feedback-rating-bars">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div
                  className="feedback-rating-row"
                  key={rating}
                >
                  <div className="feedback-rating-number">
                    <strong>{rating}</strong>
                    <Star
                      size={13}
                      fill="currentColor"
                    />
                  </div>

                  <div className="feedback-rating-track">
                    <span
                      style={{
                        width: `${getRatingPercentage(
                          rating
                        )}%`,
                      }}
                    ></span>
                  </div>

                  <strong className="feedback-rating-count">
                    {getRatingCount(rating)}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className="feedback-quote-panel">
            <Quote size={35} />

            <span>GUEST VOICE</span>

            <h2>
              Hospitality is remembered through the
              details.
            </h2>

            <p>
              Every review is an opportunity to
              celebrate what worked and discover what
              can make the next stay even better.
            </p>

            <div className="feedback-quote-signature">
              <div>LS</div>
              <span>LuxuryStay Experience Team</span>
            </div>
          </div>
        </section>

        <section className="feedback-journal">
          <div className="feedback-journal-heading">
            <div>
              <span>EXPERIENCE ARCHIVE</span>
              <h2>Guest Feedback</h2>
              <p>
                {filteredFeedback.length}{" "}
                {filteredFeedback.length === 1
                  ? "entry"
                  : "entries"}{" "}
                currently displayed.
              </p>
            </div>

            <div className="feedback-filters">
              <div className="feedback-search-box">
                <Search size={17} />
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search guest, room or feedback..."
                />
              </div>

              <div className="feedback-select-box">
                <SlidersHorizontal size={16} />
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <option value="all">
                    All Status
                  </option>
                  <option value="new">New</option>
                  <option value="reviewed">
                    Reviewed
                  </option>
                </select>
              </div>

              <div className="feedback-select-box">
                <Star size={16} />
                <select
                  value={ratingFilter}
                  onChange={(event) =>
                    setRatingFilter(event.target.value)
                  }
                >
                  <option value="all">
                    All Ratings
                  </option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="feedback-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="feedback-state">
              <RefreshCw
                size={32}
                className="feedback-spin"
              />
              <h3>Listening to guest voices...</h3>
              <p>
                LuxuryStay feedback is being loaded.
              </p>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="feedback-state">
              <MessageSquareText size={35} />
              <h3>No feedback found</h3>
              <p>
                Guest experiences matching these filters
                will appear here.
              </p>
            </div>
          ) : (
            <div className="feedback-card-grid">
              {filteredFeedback.map((item) => (
                <article
                  className={`feedback-entry ${
                    item.status === "new"
                      ? "feedback-entry-new"
                      : ""
                  }`}
                  key={item._id}
                >
                  <div className="feedback-entry-top">
                    <div className="feedback-guest">
                      <div className="feedback-avatar">
                        {item.guest?.name
                          ?.charAt(0)
                          .toUpperCase() || "G"}
                      </div>

                      <div>
                        <h3>
                          {item.guest?.name || "Guest"}
                        </h3>

                        <span>
                          <Mail size={12} />
                          {item.guest?.email ||
                            "Guest email"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`feedback-status ${
                        item.status === "reviewed"
                          ? "reviewed"
                          : "new"
                      }`}
                    >
                      {item.status === "reviewed"
                        ? "Reviewed"
                        : "New"}
                    </span>
                  </div>

                  <div className="feedback-entry-rating">
                    {renderStars(item.rating, 18)}

                    <strong>
                      {item.rating}.0
                    </strong>
                  </div>

                  <div className="feedback-entry-message">
                    <Quote size={20} />

                    <h4>
                      {item.title ||
                        "LuxuryStay Experience"}
                    </h4>

                    <p>{item.message}</p>
                  </div>

                  <div className="feedback-detail-ratings">
                    <div>
                      <span>Cleanliness</span>
                      <strong>
                        {item.cleanlinessRating
                          ? `${item.cleanlinessRating}/5`
                          : "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span>Service</span>
                      <strong>
                        {item.serviceRating
                          ? `${item.serviceRating}/5`
                          : "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span>Room</span>
                      <strong>
                        {item.roomRating
                          ? `${item.roomRating}/5`
                          : "N/A"}
                      </strong>
                    </div>
                  </div>

                  <div className="feedback-stay-info">
                    <div>
                      <BedDouble size={15} />
                      <span>
                        Room{" "}
                        {item.room?.roomNumber ||
                          "N/A"}
                      </span>
                    </div>

                    <div>
                      <CalendarDays size={15} />
                      <span>
                        {formatDate(
                          item.booking?.checkInDate
                        )}{" "}
                        —{" "}
                        {formatDate(
                          item.booking?.checkOutDate
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="feedback-entry-footer">
                    <span>
                      Submitted {formatDate(item.createdAt)}
                    </span>

                    {item.status === "new" ? (
                      <button
                        type="button"
                        onClick={() =>
                          markReviewed(item._id)
                        }
                        disabled={
                          updatingId === item._id
                        }
                      >
                        {updatingId === item._id ? (
                          <RefreshCw
                            size={15}
                            className="feedback-spin"
                          />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}

                        {updatingId === item._id
                          ? "Updating..."
                          : "Mark Reviewed"}
                      </button>
                    ) : (
                      <div className="feedback-reviewed-mark">
                        <CheckCircle2 size={15} />
                        Acknowledged
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminFeedback;