import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, googleAuth } from "./api";
import { useAuth } from "./AuthContext.js";
import { useTheme } from "./context/ThemeContext.js";
import { FaYoutube } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import "./AuthPage.css";
import { signInWithGoogle } from "./firebase";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { applyTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });

      // OTP required — new location/device detected
      if (res.data.requiresOTP) {
        navigate("/verify-otp", {
          state: {
            userId: res.data.userId,
            email: email,
          },
        });
        return;
      }

      // Apply theme based on login time
      if (res.data.theme) {
        applyTheme(res.data.theme);
      }

      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return; // prevent double-trigger causing popup-cancelled errors
    setGoogleLoading(true);
    setError("");

    try {
      const googleUser = await signInWithGoogle();
      const res = await googleAuth({
        email: googleUser.email,
        name: googleUser.displayName,
        googleId: googleUser.uid,
        avatar: googleUser.photoURL,
      });
      if (res.data.theme) applyTheme(res.data.theme);
      login(res.data);
      navigate("/");
    } catch (err) {
      setError("Google login failed. Please try again.");
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-icon-circle">
          <FaYoutube className="auth-icon" />
        </div>

        <h2 className="auth-title">Sign in</h2>
        <p className="auth-subtitle">to continue to YouTube</p>

        {error && <p className="auth-error">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Link to="/forgot-password" className="auth-forgot">
          Forgot password?
        </Link>

        <p className="auth-switch-top">
          Not your account? <Link to="/signup">Create one</Link>
        </p>

        <div className="auth-actions">
          <Link to="/signup" className="auth-create-link">
            Create account
          </Link>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing in..." : "Next"}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            <FcGoogle size={18} />
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;