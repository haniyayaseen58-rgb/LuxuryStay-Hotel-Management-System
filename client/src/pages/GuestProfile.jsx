import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  ShieldCheck,
  Save,
  RefreshCw,
  Hotel,
} from "lucide-react";

function GuestProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to load profile."
        );
        setMessageType("error");
        return;
      }

      setProfile({
        name: data.user?.name || "",
        email: data.user?.email || "",
        role: data.user?.role || "guest",
      });
    } catch (error) {
      console.error("Guest Profile Error:", error);
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!/[A-Za-z]/.test(profile.name)) {
      setMessage(
        "Name must contain at least one letter. Numbers only are not allowed."
      );
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/auth/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name,
            email: profile.email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to update profile."
        );
        setMessageType("error");
        return;
      }

      setProfile({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setMessage("Profile updated successfully!");
      setMessageType("success");
    } catch (error) {
      console.error(
        "Update Guest Profile Error:",
        error
      );

      setMessage("Unable to connect to the server.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f7f0eb 0%, #fffafa 50%, #f3e3e0 100%)",
        padding: "45px 24px",
        color: "#401d30",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/guest")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            background: "transparent",
            color: "#401d30",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "30px",
          }}
        >
          <ArrowLeft size={18} />
          Guest Dashboard
        </button>

        <section
          style={{
            background: "#401d30",
            borderRadius: "32px",
            padding: "35px",
            color: "#ffffff",
            marginBottom: "22px",
            boxShadow:
              "0 25px 60px rgba(64, 29, 48, 0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "25px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span
              style={{
                display: "block",
                color: "#f3b6a5",
                fontSize: "12px",
                letterSpacing: "2px",
                fontWeight: "800",
                marginBottom: "10px",
              }}
            >
              LUXURYSTAY MEMBER
            </span>

            <h1
              style={{
                margin: "0 0 10px",
                fontSize: "38px",
              }}
            >
              Guest Profile
            </h1>

            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.68)",
                lineHeight: "1.6",
              }}
            >
              Manage your personal account information.
            </p>
          </div>

          <div
            style={{
              width: "78px",
              height: "78px",
              borderRadius: "26px",
              background:
                "rgba(243, 182, 165, 0.15)",
              display: "grid",
              placeItems: "center",
              color: "#f3b6a5",
            }}
          >
            <Hotel size={34} />
          </div>
        </section>

        <section
          style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: "30px",
            padding: "35px",
            boxShadow:
              "0 20px 55px rgba(64, 29, 48, 0.09)",
            border:
              "1px solid rgba(64, 29, 48, 0.06)",
          }}
        >
          {loading ? (
            <div
              style={{
                minHeight: "280px",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
              }}
            >
              <div>
                <RefreshCw
                  size={30}
                  style={{
                    marginBottom: "15px",
                  }}
                />

                <strong
                  style={{
                    display: "block",
                  }}
                >
                  Loading your profile...
                </strong>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  paddingBottom: "28px",
                  marginBottom: "28px",
                  borderBottom:
                    "1px solid rgba(64,29,48,0.08)",
                }}
              >
                <div
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "22px",
                    background: "#f7e5e1",
                    display: "grid",
                    placeItems: "center",
                    color: "#401d30",
                    fontSize: "25px",
                    fontWeight: "800",
                  }}
                >
                  {profile.name
                    ?.charAt(0)
                    .toUpperCase() || "G"}
                </div>

                <div>
                  <h2
                    style={{
                      margin: "0 0 5px",
                    }}
                  >
                    {profile.name || "Guest"}
                  </h2>

                  <span
                    style={{
                      color: "#947b86",
                    }}
                  >
                    LuxuryStay Guest Account
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "20px",
                }}
              >
                <label>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontWeight: "700",
                      marginBottom: "9px",
                    }}
                  >
                    <UserRound size={16} />
                    Full Name
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "15px 16px",
                      borderRadius: "14px",
                      border:
                        "1px solid rgba(64,29,48,0.14)",
                      outline: "none",
                      background: "#fffafa",
                      color: "#401d30",
                      fontSize: "15px",
                    }}
                  />
                </label>

                <label>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontWeight: "700",
                      marginBottom: "9px",
                    }}
                  >
                    <Mail size={16} />
                    Email Address
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "15px 16px",
                      borderRadius: "14px",
                      border:
                        "1px solid rgba(64,29,48,0.14)",
                      outline: "none",
                      background: "#fffafa",
                      color: "#401d30",
                      fontSize: "15px",
                    }}
                  />
                </label>
              </div>

              <div
                style={{
                  marginTop: "22px",
                  padding: "17px 18px",
                  borderRadius: "16px",
                  background: "#f8eeee",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <ShieldCheck
                  size={21}
                  color="#b16f73"
                />

                <div>
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "3px",
                    }}
                  >
                    Account Type
                  </strong>

                  <span
                    style={{
                      color: "#806975",
                      textTransform: "capitalize",
                    }}
                  >
                    {profile.role} account
                  </span>
                </div>
              </div>

              {message && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    background:
                      messageType === "success"
                        ? "#edf8f0"
                        : "#fff0f0",
                    color:
                      messageType === "success"
                        ? "#39734b"
                        : "#a94442",
                    fontWeight: "700",
                  }}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                style={{
                  marginTop: "25px",
                  border: "none",
                  borderRadius: "15px",
                  padding: "14px 22px",
                  background: "#401d30",
                  color: "#ffffff",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "800",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "9px",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <RefreshCw size={18} />
                ) : (
                  <Save size={18} />
                )}

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default GuestProfile;