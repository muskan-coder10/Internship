import { useLocation, useNavigate, Link } from "react-router-dom";
import "./PaymentSuccess.css";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan, amount, transactionId } = location.state || {};

  if (!plan) {
    navigate("/");
    return null;
  }

  return (
    <div className="payment-success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>

        <h2 className="success-title">Payment Successful!</h2>
        <p className="success-subtitle">
          Your <strong>{plan} Plan</strong> has been activated successfully.
        </p>

        <div className="success-details">
          <div className="success-detail-row">
            <span className="detail-label">Plan</span>
            <span className="detail-value plan-name">{plan}</span>
          </div>
          <div className="success-detail-row">
            <span className="detail-label">Amount Paid</span>
            <span className="detail-value">₹{amount}</span>
          </div>
          <div className="success-detail-row">
            <span className="detail-label">Transaction ID</span>
            <span className="detail-value transaction-id">{transactionId}</span>
          </div>
          <div className="success-detail-row">
            <span className="detail-label">Duration</span>
            <span className="detail-value">1 Month</span>
          </div>
          <div className="success-detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="success-actions">
          <Link to="/" className="success-btn primary-btn">
            Go to Homepage
          </Link>
          <Link to="/downloads" className="success-btn secondary-btn">
            View Downloads
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;