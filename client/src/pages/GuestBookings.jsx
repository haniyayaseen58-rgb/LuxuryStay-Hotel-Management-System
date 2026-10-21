import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  BedDouble,
  Users,
  CalendarDays,
  Wallet,
  Clock3,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  RefreshCw,
  Hotel,
  ShieldCheck,
  Star,
  MessageSquareText,
  X,
  Sparkles,
  Send,
} from "lucide-react";
import API_BASE_URL from "../config/api";

function GuestBookings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    cleanlinessRating: 0,
    serviceRating: 0,
    roomRating: 0,
    title: "",
    message: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [bookingResponse, feedbackResponse] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/api/bookings/my-bookings`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${API_BASE_URL}/api/feedback/my`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      const bookingData = await bookingResponse.json();
      const feedbackData = await feedbackResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(
          bookingData.message ||
            "Unable to load your bookings."
        );
      }

      const bookingList = Array.isArray(bookingData)
        ? bookingData
        : bookingData.bookings || [];

      setBookings(bookingList);

      if (feedbackResponse.ok) {
        setFeedbackList(feedbackData.feedback || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK");

  const getStatusIcon = (status) => {
    if (status === "confirmed") {
      return <CheckCircle2 size={17} />;
    }

    if (
      status === "rejected" ||
      status === "cancelled"
    ) {
      return <XCircle size={17} />;
    }

    if (status === "checked-in") {
      return <LogIn size={17} />;
    }

    if (status === "checked-out") {
      return <LogOut size={17} />;
    }

    return <Clock3 size={17} />;
  };

  const getStatusLabel = (status) => {
    if (status === "checked-in") {
      return "Checked-In";
    }

    if (status === "checked-out") {
      return "Checked-Out";
    }

    if (!status) {
      return "Pending";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const getBookingFeedback = (bookingId) =>
    feedbackList.find((item) => {
      const feedbackBookingId =
        typeof item.booking === "object"
          ? item.booking?._id
          : item.booking;

      return String(feedbackBookingId) === String(bookingId);
    });

  const openFeedback = (booking) => {
    setSelectedBooking(booking);
    setFeedbackError("");
    setSuccessMessage("");
    setFeedbackForm({
      rating: 0,
      cleanlinessRating: 0,
      serviceRating: 0,
      roomRating: 0,
      title: "",
      message: "",
    });
  };

  const closeFeedback = () => {
    if (submitting) return;

    setSelectedBooking(null);
    setFeedbackError("");
  };

  const handleFeedbackChange = (event) => {
    const { name, value } = event.target;

    setFeedbackForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submitFeedback = async (event) => {
    event.preventDefault();

    if (!feedbackForm.rating) {
      setFeedbackError(
        "Please select your overall stay rating."
      );
      return;
    }

    if (!feedbackForm.message.trim()) {
      setFeedbackError(
        "Please write a short feedback message."
      );
      return;
    }

    try {
      setSubmitting(true);
      setFeedbackError("");

      const response = await fetch(
        `${API_BASE_URL}/api/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId: selectedBooking._id,
            rating: feedbackForm.rating,
            cleanlinessRating:
              feedbackForm.cleanlinessRating || null,
            serviceRating:
              feedbackForm.serviceRating || null,
            roomRating:
              feedbackForm.roomRating || null,
            title: feedbackForm.title,
            message: feedbackForm.message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit feedback."
        );
      }

      setFeedbackList((previous) => [
        data.feedback,
        ...previous,
      ]);

      setSelectedBooking(null);
      setSuccessMessage(
        "Thank you! Your stay feedback has been submitted successfully."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      setFeedbackError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const RatingStars = ({
    value,
    onChange,
    size = 27,
  }) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              width: size + 7,
              height: size + 7,
              display: "grid",
              placeItems: "center",
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color:
                star <= value
                  ? "#c98a5b"
                  : "#d9cbc6",
              transition:
                "transform .2s ease, color .2s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform =
                "scale(1.18) rotate(-5deg)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform =
                "scale(1)";
            }}
          >
            <Star
              size={size}
              fill={
                star <= value
                  ? "currentColor"
                  : "transparent"
              }
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f7f0eb 0%, #fffaf7 55%, #f3e4df 100%)",
        padding: "40px 25px 70px",
        fontFamily: "Arial, sans-serif",
        color: "#401d30",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            marginBottom: "35px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/guest")}
            style={{
              border:
                "1px solid rgba(64,29,48,0.12)",
              background: "#ffffff",
              color: "#401d30",
              borderRadius: "14px",
              padding: "11px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "700",
            }}
          >
            <ArrowLeft size={18} />
           Guest Dashboard
          </button>

          <button
            type="button"
            onClick={loadData}
            style={{
              border: "none",
              background: "#401d30",
              color: "#ffffff",
              borderRadius: "14px",
              padding: "11px 17px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "700",
            }}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(120deg, #28101e 0%, #401d30 55%, #63394f 100%)",
            color: "#ffffff",
            borderRadius: "12px 45px 12px 45px",
            padding: "50px",
            marginBottom: "30px",
            boxShadow:
              "0 30px 70px rgba(64,29,48,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#f3b6a5",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "2px",
              marginBottom: "15px",
            }}
          >
            <CalendarCheck size={16} />
            YOUR STAYS
          </div>

          <h1
            style={{
              margin: "0 0 15px",
              fontSize: "clamp(38px, 6vw, 65px)",
              lineHeight: "1",
            }}
          >
            My Bookings
          </h1>

          <p
            style={{
              maxWidth: "650px",
              margin: 0,
              lineHeight: "1.8",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            View your reservations, room details, stay
            dates, payment amount and current booking
            status.
          </p>

          <div
            style={{
              marginTop: "28px",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 15px",
              borderRadius: "50px",
              background: "rgba(255,255,255,0.08)",
              border:
                "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Hotel size={17} />
            <strong>{bookings.length}</strong>
            <span
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "13px",
              }}
            >
              Total Reservations
            </span>
          </div>
        </div>

        {successMessage && (
          <div
            style={{
              padding: "16px 18px",
              borderRadius: "15px",
              marginBottom: "22px",
              background: "#edf7f0",
              color: "#356047",
              border: "1px solid #cce2d2",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: "700",
            }}
          >
            <CheckCircle2 size={19} />
            {successMessage}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "15px 18px",
              borderRadius: "14px",
              marginBottom: "22px",
              background: "#fff0ee",
              color: "#8b3535",
              border: "1px solid #f0ccc7",
              display: "flex",
              alignItems: "center",
              gap: "9px",
              fontWeight: "700",
            }}
          >
            <XCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              minHeight: "300px",
              background: "#ffffff",
              borderRadius: "30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 15px 45px rgba(64,29,48,0.07)",
            }}
          >
            <RefreshCw size={32} />
            <h2>Loading your bookings...</h2>
            <p style={{ color: "#806975" }}>
              Your LuxuryStay reservations are being
              loaded.
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div
            style={{
              minHeight: "340px",
              padding: "40px",
              background: "#ffffff",
              borderRadius: "12px 35px 12px 35px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow:
                "0 15px 45px rgba(64,29,48,0.07)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                background: "#f7e7e1",
                marginBottom: "18px",
              }}
            >
              <BedDouble size={30} />
            </div>

            <h2 style={{ margin: "0 0 8px" }}>
              No bookings yet
            </h2>

            <p
              style={{
                margin: "0 0 22px",
                color: "#806975",
              }}
            >
              Your room reservations will appear here.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/guest/book-room")
              }
              style={{
                border: "none",
                background: "#401d30",
                color: "#ffffff",
                borderRadius: "13px",
                padding: "13px 20px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              Book Your First Room
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(330px, 1fr))",
              gap: "22px",
            }}
          >
            {bookings.map((booking) => {
              const submittedFeedback =
                getBookingFeedback(booking._id);

              return (
                <div
                  key={booking._id}
                  style={{
                    overflow: "hidden",
                    background: "#ffffff",
                    borderRadius:
                      "10px 28px 10px 28px",
                    border:
                      "1px solid rgba(64,29,48,0.08)",
                    boxShadow:
                      "0 18px 45px rgba(64,29,48,0.08)",
                  }}
                >
                  <div
                    style={{
                      padding: "24px",
                      background:
                        "linear-gradient(135deg, #401d30, #60364d)",
                      color: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent:
                          "space-between",
                        gap: "15px",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            color: "#f3b6a5",
                            fontSize: "10px",
                            fontWeight: "800",
                            letterSpacing: "1.5px",
                          }}
                        >
                          ROOM{" "}
                          {booking.room?.roomNumber ||
                            "N/A"}
                        </span>

                        <h2
                          style={{
                            margin: "7px 0 4px",
                            fontSize: "24px",
                          }}
                        >
                          {booking.room?.name ||
                            "LuxuryStay Room"}
                        </h2>

                        <span
                          style={{
                            color:
                              "rgba(255,255,255,0.65)",
                            fontSize: "12px",
                          }}
                        >
                          {booking.room?.type ||
                            "Guest Reservation"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 10px",
                          borderRadius: "50px",
                          background:
                            "rgba(255,255,255,0.1)",
                          fontSize: "10px",
                          fontWeight: "800",
                        }}
                      >
                        {getStatusIcon(
                          booking.bookingStatus
                        )}
                        {getStatusLabel(
                          booking.bookingStatus
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "24px" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <InfoBox
                        icon={<CalendarDays size={17} />}
                        label="Check-In"
                        value={formatDate(
                          booking.checkInDate
                        )}
                      />

                      <InfoBox
                        icon={<CalendarDays size={17} />}
                        label="Check-Out"
                        value={formatDate(
                          booking.checkOutDate
                        )}
                      />

                      <InfoBox
                        icon={<Users size={17} />}
                        label="Guests"
                        value={
                          booking.numberOfGuests || 1
                        }
                      />

                      <InfoBox
                        icon={<Wallet size={17} />}
                        label="Total Amount"
                        value={`Rs. ${formatAmount(
                          booking.totalAmount
                        )}`}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: "17px",
                        padding: "14px 15px",
                        borderRadius: "13px",
                        background: "#f5ebe7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "space-between",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <ShieldCheck size={17} />
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          Verification
                        </span>
                      </div>

                      <strong
                        style={{
                          fontSize: "11px",
                          textTransform: "capitalize",
                        }}
                      >
                        {booking.verificationStatus ||
                          "pending"}
                      </strong>
                    </div>

                    {booking.specialRequests && (
                      <div
                        style={{
                          marginTop: "15px",
                          paddingTop: "15px",
                          borderTop:
                            "1px solid rgba(64,29,48,0.08)",
                        }}
                      >
                        <small
                          style={{
                            color: "#9b858f",
                            fontWeight: "700",
                          }}
                        >
                          SPECIAL REQUEST
                        </small>

                        <p
                          style={{
                            margin: "6px 0 0",
                            color: "#6f5d66",
                            fontSize: "13px",
                            lineHeight: "1.6",
                          }}
                        >
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    {booking.bookingStatus ===
                      "checked-out" && (
                      <div
                        style={{
                          marginTop: "18px",
                          paddingTop: "18px",
                          borderTop:
                            "1px solid rgba(64,29,48,0.08)",
                        }}
                      >
                        {submittedFeedback ? (
                          <div
                            style={{
                              padding: "14px 15px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent:
                                "space-between",
                              gap: "12px",
                              borderRadius: "14px",
                              background: "#edf7f0",
                              color: "#356047",
                              border:
                                "1px solid #d3e8d9",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <CheckCircle2
                                size={18}
                              />
                              <strong
                                style={{
                                  fontSize: "12px",
                                }}
                              >
                                Feedback Submitted
                              </strong>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              {[
                                1, 2, 3, 4, 5,
                              ].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  fill={
                                    star <=
                                    submittedFeedback.rating
                                      ? "#c98a5b"
                                      : "transparent"
                                  }
                                  color={
                                    star <=
                                    submittedFeedback.rating
                                      ? "#c98a5b"
                                      : "#cbbcb7"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              openFeedback(booking)
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              padding:
                                "14px 18px",
                              borderRadius: "14px",
                              background:
                                "linear-gradient(135deg, #401d30, #67384f)",
                              color: "#ffffff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent:
                                "center",
                              gap: "9px",
                              fontWeight: "800",
                              boxShadow:
                                "0 12px 25px rgba(64,29,48,0.15)",
                            }}
                          >
                            <Star size={18} />
                            Leave Feedback
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedBooking && (
        <div
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeFeedback();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            padding: "25px",
            display: "grid",
            placeItems: "center",
            overflowY: "auto",
            background: "rgba(24,10,18,0.72)",
            backdropFilter: "blur(9px)",
          }}
        >
          <form
            onSubmit={submitFeedback}
            style={{
              width: "min(680px, 100%)",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "#fffaf7",
              borderRadius: "12px 35px 12px 35px",
              boxShadow:
                "0 35px 90px rgba(0,0,0,0.28)",
            }}
          >
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                padding: "30px",
                background:
                  "linear-gradient(135deg, #301321, #401d30 55%, #6b3a51)",
                color: "#ffffff",
              }}
            >
              <button
                type="button"
                onClick={closeFeedback}
                style={{
                  width: "38px",
                  height: "38px",
                  position: "absolute",
                  top: "18px",
                  right: "18px",
                  display: "grid",
                  placeItems: "center",
                  border: "none",
                  borderRadius: "50%",
                  background:
                    "rgba(255,255,255,0.1)",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <X size={19} />
              </button>

              <div
                style={{
                  width: "47px",
                  height: "47px",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: "15px",
                  borderRadius: "15px 15px 15px 5px",
                  background:
                    "rgba(243,182,165,0.14)",
                  color: "#f3b6a5",
                }}
              >
                <Sparkles size={22} />
              </div>

              <span
                style={{
                  color: "#f3b6a5",
                  fontSize: "9px",
                  fontWeight: "900",
                  letterSpacing: "2px",
                }}
              >
                YOUR LUXURYSTAY EXPERIENCE
              </span>

              <h2
                style={{
                  margin: "8px 0 7px",
                  fontSize: "31px",
                  fontFamily: "Georgia, serif",
                  fontWeight: "500",
                }}
              >
                How was your stay?
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,.62)",
                  fontSize: "12px",
                }}
              >
                Room{" "}
                {selectedBooking.room?.roomNumber ||
                  "N/A"}{" "}
                ·{" "}
                {selectedBooking.room?.name ||
                  "LuxuryStay Room"}
              </p>
            </div>

            <div style={{ padding: "30px" }}>
              <div
                style={{
                  padding: "20px",
                  marginBottom: "20px",
                  textAlign: "center",
                  borderRadius: "20px 7px 20px 7px",
                  background: "#f7ebe7",
                }}
              >
                <span
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    color: "#866c78",
                    fontSize: "9px",
                    fontWeight: "900",
                    letterSpacing: "1.3px",
                  }}
                >
                  OVERALL EXPERIENCE
                </span>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <RatingStars
                    value={feedbackForm.rating}
                    size={31}
                    onChange={(rating) =>
                      setFeedbackForm(
                        (previous) => ({
                          ...previous,
                          rating,
                        })
                      )
                    }
                  />
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "8px",
                    color: "#401d30",
                    fontSize: "12px",
                  }}
                >
                  {feedbackForm.rating === 5
                    ? "Exceptional"
                    : feedbackForm.rating === 4
                      ? "Very Good"
                      : feedbackForm.rating === 3
                        ? "Good"
                        : feedbackForm.rating === 2
                          ? "Could Be Better"
                          : feedbackForm.rating === 1
                            ? "Needs Improvement"
                            : "Select a rating"}
                </strong>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <RatingBox
                  title="Cleanliness"
                  value={
                    feedbackForm.cleanlinessRating
                  }
                  onChange={(value) =>
                    setFeedbackForm(
                      (previous) => ({
                        ...previous,
                        cleanlinessRating: value,
                      })
                    )
                  }
                />

                <RatingBox
                  title="Service"
                  value={feedbackForm.serviceRating}
                  onChange={(value) =>
                    setFeedbackForm(
                      (previous) => ({
                        ...previous,
                        serviceRating: value,
                      })
                    )
                  }
                />

                <RatingBox
                  title="Room"
                  value={feedbackForm.roomRating}
                  onChange={(value) =>
                    setFeedbackForm(
                      (previous) => ({
                        ...previous,
                        roomRating: value,
                      })
                    )
                  }
                />
              </div>

              <label
                style={{
                  display: "block",
                  marginBottom: "17px",
                }}
              >
                <span
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#735966",
                    fontSize: "10px",
                    fontWeight: "800",
                  }}
                >
                  FEEDBACK TITLE
                </span>

                <input
                  type="text"
                  name="title"
                  value={feedbackForm.title}
                  onChange={handleFeedbackChange}
                  maxLength={100}
                  placeholder="A memorable stay"
                  style={{
                    width: "100%",
                    padding: "13px 15px",
                    outline: "none",
                    border:
                      "1px solid rgba(64,29,48,.12)",
                    borderRadius: "12px",
                    background: "#ffffff",
                    color: "#401d30",
                    fontFamily: "inherit",
                  }}
                />
              </label>

              <label style={{ display: "block" }}>
                <span
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#735966",
                    fontSize: "10px",
                    fontWeight: "800",
                  }}
                >
                  TELL US ABOUT YOUR STAY
                </span>

                <textarea
                  name="message"
                  value={feedbackForm.message}
                  onChange={handleFeedbackChange}
                  maxLength={1000}
                  rows={5}
                  placeholder="Share what you enjoyed about your LuxuryStay experience..."
                  style={{
                    width: "100%",
                    resize: "vertical",
                    padding: "14px 15px",
                    outline: "none",
                    border:
                      "1px solid rgba(64,29,48,.12)",
                    borderRadius: "12px",
                    background: "#ffffff",
                    color: "#401d30",
                    fontFamily: "inherit",
                    lineHeight: "1.6",
                  }}
                />
              </label>

              <div
                style={{
                  marginTop: "5px",
                  color: "#a28a95",
                  fontSize: "9px",
                  textAlign: "right",
                }}
              >
                {feedbackForm.message.length}/1000
              </div>

              {feedbackError && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "11px",
                    background: "#fff0ee",
                    color: "#923f48",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  <XCircle size={16} />
                  {feedbackError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "14px 18px",
                  border: "none",
                  borderRadius: "13px",
                  background: submitting
                    ? "#8c7180"
                    : "#401d30",
                  color: "#ffffff",
                  cursor: submitting
                    ? "not-allowed"
                    : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "9px",
                  fontWeight: "800",
                  boxShadow:
                    "0 12px 25px rgba(64,29,48,.17)",
                }}
              >
                {submitting ? (
                  <RefreshCw size={18} />
                ) : (
                  <Send size={18} />
                )}
                {submitting
                  ? "Submitting..."
                  : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "13px",
        background: "#faf5f1",
      }}
    >
      <div style={{ marginBottom: "8px" }}>
        {icon}
      </div>

      <small
        style={{
          display: "block",
          color: "#9b858f",
          marginBottom: "4px",
        }}
      >
        {label}
      </small>

      <strong>{value}</strong>
    </div>
  );
}

function RatingBox({ title, value, onChange }) {
  return (
    <div
      style={{
        padding: "14px",
        border:
          "1px solid rgba(64,29,48,.07)",
        borderRadius: "15px 5px 15px 5px",
        background: "#fff",
      }}
    >
      <strong
        style={{
          display: "block",
          marginBottom: "9px",
          color: "#735966",
          fontSize: "10px",
        }}
      >
        {title}
      </strong>

      <div
        style={{
          display: "flex",
          gap: "2px",
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              padding: "1px",
              border: "none",
              background: "transparent",
              color:
                star <= value
                  ? "#c98a5b"
                  : "#d9cbc6",
              cursor: "pointer",
            }}
          >
            <Star
              size={18}
              fill={
                star <= value
                  ? "currentColor"
                  : "transparent"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default GuestBookings;