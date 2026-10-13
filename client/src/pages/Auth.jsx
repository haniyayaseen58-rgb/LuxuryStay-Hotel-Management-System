
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  Gem,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

import "./Auth.css";

const API_URL = "http://localhost:5000/api/auth";

function Auth() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const isVerify = mode === "verify";
  const isReset = mode === "reset";
  const isRecovery = isForgot || isVerify || isReset;

  const notify = (text, success = false) => {
    setMessage(text);
    setMessageSuccess(success);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setMessage("");
    setMessageSuccess(false);
    setShowPassword(false);
    setPassword("");
    setOtp("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const postRequest = async (endpoint, body) => {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    notify("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await postRequest("login", {
          email,
          password,
        });

        if (!data.token || !data.user) {
          throw new Error("Invalid login response from server.");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "admin") {
          navigate("/admin", { replace: true });
          return;
        }

        if (data.user.role === "staff") {
          navigate("/staff", { replace: true });
          return;
        }

        if (data.user.role === "guest") {
          navigate("/guest", { replace: true });
          return;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Invalid user role.");
      }

      if (isRegister) {
        if (!/[A-Za-z]/.test(name)) {
          throw new Error(
            "Username must contain at least one letter. Numbers only are not allowed."
          );
        }

        await postRequest("register", {
          name,
          email,
          password,
        });

        setName("");
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setMode("login");

        notify(
          "Account created successfully! Please sign in.",
          true
        );
        return;
      }

      if (isForgot) {
        await postRequest("forgot-password", {
          email: email.trim(),
        });

        setMode("verify");
        notify(
          "If your email is registered, a 6-digit code will arrive shortly. Check your inbox and spam.",
          true
        );
        return;
      }

      if (isVerify) {
        const data = await postRequest("verify-otp", {
          email: email.trim(),
          otp: otp.trim(),
        });

        if (!data.resetToken) {
          throw new Error("Verification session not received.");
        }

        setResetToken(data.resetToken);
        setOtp("");
        setMode("reset");
        notify("Email verified. Create your new password.", true);
        return;
      }

      if (isReset) {
        if (newPassword !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        if (newPassword.length < 6) {
          throw new Error(
            "Password must be at least 6 characters."
          );
        }

        await postRequest("reset-password", {
          email: email.trim(),
          resetToken,
          newPassword,
          confirmPassword,
        });

        setNewPassword("");
        setConfirmPassword("");
        setResetToken("");
        setPassword("");
        setMode("login");

        notify(
          "Password reset successfully! Sign in with your new password.",
          true
        );
      }
    } catch (error) {
      console.error("Authentication Error:", error);
      notify(
        error.message === "Failed to fetch"
          ? "Unable to connect to the server."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const headings = {
    login: {
      eyebrow: "WELCOME BACK",
      title: "Welcome back.",
      description:
        "Enter your details to continue your LuxuryStay experience.",
      button: "Sign In",
    },
    register: {
      eyebrow: "JOIN LUXURYSTAY",
      title: "Create your account.",
      description:
        "Create your guest account and make every stay beautifully effortless.",
      button: "Create My Account",
    },
    forgot: {
      eyebrow: "ACCOUNT RECOVERY",
      title: "Forgot your password?",
      description:
        "Enter your registered email address and we'll send you a verification code.",
      button: "Send Verification Code",
    },
    verify: {
      eyebrow: "EMAIL VERIFICATION",
      title: "Verify your email.",
      description:
        "Enter the 6-digit verification code sent to your registered email. The code expires in 5 minutes.",
      button: "Verify OTP",
    },
    reset: {
      eyebrow: "SECURE YOUR ACCOUNT",
      title: "Create new password.",
      description:
        "Choose a new password to securely access your LuxuryStay account.",
      button: "Reset Password",
    },
  };

  const current = headings[mode];

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <motion.div
        className="auth-shell"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <section className="auth-intro">
          <Link to="/" className="auth-back">
            <ArrowLeft size={16} />
            Back to LuxuryStay
          </Link>

          <div className="auth-brand">
            <Gem size={21} />
            <span>
              LUXURY<strong>STAY</strong>
            </span>
          </div>

          <div className="auth-copy">
            <div className="auth-eyebrow">
              <Sparkles size={14} />
              <span>YOUR PRIVATE ESCAPE</span>
            </div>

            <h1>
              Your journey
              <span> begins here.</span>
            </h1>

            <p>
              Sign in to manage your reservations, discover
              exceptional stays and enjoy a more personal
              LuxuryStay experience.
            </p>
          </div>

          <div className="auth-quote">
            <span>THE LUXURYSTAY PROMISE</span>
            <p>
              “Every arrival should feel like coming somewhere
              special.”
            </p>
          </div>
        </section>

        <section className="auth-form-side">
          <div className="auth-form-wrapper">
            {!isRecovery && (
              <div className="auth-switch">
                <button
                  type="button"
                  className={isLogin ? "active" : ""}
                  onClick={() => changeMode("login")}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  className={isRegister ? "active" : ""}
                  onClick={() => changeMode("register")}
                >
                  Create Account
                </button>
              </div>
            )}

            {isRecovery && (
              <button
                type="button"
                className="auth-recovery-back"
                onClick={() => changeMode("login")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  marginBottom: "24px",
                  color: "#8b6171",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="auth-form-heading">
                  <span>{current.eyebrow}</span>
                  <h2>{current.title}</h2>
                  <p>{current.description}</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {isRegister && (
                    <div className="auth-input-group">
                      <label>FULL NAME</label>
                      <div className="auth-input">
                        <UserRound size={17} />
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) =>
                            setName(e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  )}

                  {!isReset && (
                    <div className="auth-input-group">
                      <label>EMAIL ADDRESS</label>
                      <div className="auth-input">
                        <Mail size={17} />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          readOnly={isVerify}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {(isLogin || isRegister) && (
                    <div className="auth-input-group">
                      <label>PASSWORD</label>
                      <div className="auth-input">
                        <LockKeyhole size={17} />
                        <input
                          type={
                            showPassword ? "text" : "password"
                          }
                          placeholder={
                            isLogin
                              ? "Enter your password"
                              : "Create a strong password"
                          }
                          value={password}
                          onChange={(e) =>
                            setPassword(e.target.value)
                          }
                          minLength={6}
                          required
                        />

                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                          aria-label="Show or hide password"
                        >
                          {showPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {isLogin && (
                    <div className="auth-options">
                      <label className="remember-me">
                        <input type="checkbox" />
                        <span>Remember me</span>
                      </label>

                      <button
                        type="button"
                        className="forgot-password"
                        onClick={() => changeMode("forgot")}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {isVerify && (
                    <div className="auth-input-group">
                      <label>6-DIGIT VERIFICATION CODE</label>
                      <div className="auth-input">
                        <ShieldCheck size={17} />
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          pattern="[0-9]{6}"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) =>
                            setOtp(
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          required
                        />
                      </div>

                      <button
                        type="button"
                        className="forgot-password"
                        onClick={() => changeMode("forgot")}
                        style={{
                          display: "block",
                          marginTop: "12px",
                          marginLeft: "auto",
                        }}
                      >
                        Didn't receive the code? Try again
                      </button>
                    </div>
                  )}

                  {isReset && (
                    <>
                      <div className="auth-input-group">
                        <label>NEW PASSWORD</label>
                        <div className="auth-input">
                          <KeyRound size={17} />
                          <input
                            type={
                              showPassword ? "text" : "password"
                            }
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) =>
                              setNewPassword(e.target.value)
                            }
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                              setShowPassword(!showPassword)
                            }
                          >
                            {showPassword ? (
                              <EyeOff size={17} />
                            ) : (
                              <Eye size={17} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <label>CONFIRM PASSWORD</label>
                        <div className="auth-input">
                          <LockKeyhole size={17} />
                          <input
                            type={
                              showPassword ? "text" : "password"
                            }
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) =>
                              setConfirmPassword(e.target.value)
                            }
                            minLength={6}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {message && (
                    <p
                      role="status"
                      style={{
                        marginBottom: "15px",
                        color: messageSuccess
                          ? "#4f7a5a"
                          : "#bd6f78",
                        fontSize: "12px",
                        lineHeight: 1.6,
                        textAlign: "center",
                      }}
                    >
                      {message}
                    </p>
                  )}

                  <button
                    className="auth-submit"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Please wait..." : current.button}

                    {!loading && <ArrowUpRight size={18} />}
                  </button>
                </form>

                {!isRecovery && (
                  <p className="auth-change">
                    {isLogin
                      ? "New to LuxuryStay?"
                      : "Already have an account?"}

                    <button
                      type="button"
                      onClick={() =>
                        changeMode(
                          isLogin ? "register" : "login"
                        )
                      }
                    >
                      {isLogin
                        ? "Create an account"
                        : "Sign in"}
                    </button>
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </motion.div>
    </main>
  );
}

export default Auth;
