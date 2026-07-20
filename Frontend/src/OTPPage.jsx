import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP } from "./api";
import { useAuth } from "./AuthContext.js";
import { useTheme } from "./context/ThemeContext.js";
import "./OTPPage.css";

function OTPPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { applyTheme } = useTheme();

  const { userId, email } = location.state || {};

  if (!userId) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await verifyOTP({ userId, otp });
      applyTheme(res.data.theme);
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-card">
        <div className="otp-icon">🔐</div>
        <h2 className="otp-title">Verify Your Identity</h2>
        <p className="otp-subtitle">
          We detected a login from a new location or device.
          <br />
          An OTP has been sent to <strong>{email}</strong>
        </p>

        {error && <p className="otp-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            className="otp-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />

          <button type="submit" className="otp-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="otp-note">OTP expires in 10 minutes.</p>

        <button
          className="otp-back"
          onClick={() => navigate("/login")}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default OTPPage;