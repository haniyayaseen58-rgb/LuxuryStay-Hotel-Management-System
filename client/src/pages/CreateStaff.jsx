import "./CreateStaff.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

function CreateStaff() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/auth/create-staff",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create staff account.");
        return;
      }

      setMessage("Staff account created successfully!");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Create Staff Error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-staff-page">
      <div className="create-staff-card">
        <button
          type="button"
          className="staff-back-btn"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="staff-heading">
          <div className="staff-heading-icon">
            <UserPlus size={25} />
          </div>

          <span>STAFF MANAGEMENT</span>
          <h1>Create Staff Account</h1>
          <p>
            Add an authorized LuxuryStay staff member and provide secure access
            to the staff dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="staff-form">
          <div className="staff-input-group">
            <label>FULL NAME</label>

            <div className="staff-input">
              <UserRound size={18} />

              <input
                type="text"
                placeholder="Enter staff full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="staff-input-group">
            <label>EMAIL ADDRESS</label>

            <div className="staff-input">
              <Mail size={18} />

              <input
                type="email"
                placeholder="staff@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="staff-input-group">
            <label>PASSWORD</label>

            <div className="staff-input">
              <LockKeyhole size={18} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create staff password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />

              <button
                type="button"
                className="staff-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {message && (
            <p className="staff-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="create-staff-btn"
            disabled={loading}
          >
            <UserPlus size={18} />
            {loading ? "Creating Account..." : "Create Staff Account"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default CreateStaff;