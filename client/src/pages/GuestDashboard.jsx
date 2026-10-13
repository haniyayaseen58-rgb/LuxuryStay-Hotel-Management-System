import { useNavigate } from "react-router-dom";
import {
  BedDouble,
  CalendarCheck,
  UserRound,
  LogOut,
} from "lucide-react";

function GuestDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f0eb",
        padding: "50px",
        color: "#401d30",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "45px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "2px",
                color: "#b16f73",
              }}
            >
              LUXURYSTAY GUEST
            </p>

            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "40px",
              }}
            >
              Welcome, {user?.name || "Guest"} 💜
            </h1>

            <p
              style={{
                margin: 0,
                color: "#806975",
              }}
            >
              Manage your LuxuryStay experience.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "none",
              borderRadius: "14px",
              padding: "13px 18px",
              background: "#401d30",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/guest/book-room")}
            style={{
              textAlign: "left",
              border: "none",
              borderRadius: "25px",
              padding: "28px",
              background: "#401d30",
              color: "#ffffff",
              cursor: "pointer",
              boxShadow:
                "0 20px 45px rgba(64, 29, 48, 0.16)",
            }}
          >
            <BedDouble
              size={30}
              style={{
                marginBottom: "25px",
                color: "#f3b6a5",
              }}
            />

            <h2
              style={{
                margin: "0 0 8px",
              }}
            >
              Book a Room
            </h2>

            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.65)",
                lineHeight: "1.6",
              }}
            >
              Choose your room and request a new reservation.
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/guest/my-bookings")}
            style={{
              textAlign: "left",
              border: "none",
              borderRadius: "25px",
              padding: "28px",
              background: "#ffffff",
              color: "#401d30",
              cursor: "pointer",
              boxShadow:
                "0 15px 40px rgba(64, 29, 48, 0.08)",
            }}
          >
            <CalendarCheck
              size={30}
              style={{
                marginBottom: "25px",
                color: "#401d30",
              }}
            />

            <h2
              style={{
                margin: "0 0 8px",
              }}
            >
              My Bookings
            </h2>

            <p
              style={{
                margin: 0,
                color: "#806975",
                lineHeight: "1.6",
              }}
            >
              View your reservations and booking status.
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/guest/profile")}
            style={{
              textAlign: "left",
              border: "none",
              borderRadius: "25px",
              padding: "28px",
              background: "#ffffff",
              color: "#401d30",
              cursor: "pointer",
              boxShadow:
                "0 15px 40px rgba(64, 29, 48, 0.08)",
            }}
          >
            <UserRound
              size={30}
              style={{
                marginBottom: "25px",
                color: "#401d30",
              }}
            />

            <h2
              style={{
                margin: "0 0 8px",
              }}
            >
              Guest Profile
            </h2>

            <p
              style={{
                margin: 0,
                color: "#806975",
                lineHeight: "1.6",
              }}
            >
              View and manage your guest information.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuestDashboard;