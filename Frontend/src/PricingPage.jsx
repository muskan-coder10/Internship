import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder, verifyPayment } from "./api.js";
import { useAuth } from "./AuthContext.js";
import "./PricingPage.css";

const plans = [
  {
    name: "Free",
    price: 0,
    color: "#64B5F6",
    textColor: "#000000",
    features: [
      "1 download per day",
      "Basic video access",
      "Watch Party",
      "Upload videos",
    ],
    plan: "free",
  },
  {
    name: "Bronze",
    price: 99,
    color: "#BF360C",
    textColor: "#fff",
    features: [
      "5 downloads per day",
      "All Free features",
      "Priority support",
    ],
    plan: "bronze",
  },
  {
    name: "Silver",
    price: 199,
    color: "#c0c0c0",
    textColor: "#212121",
    features: [
      "15 downloads per day",
      "All Bronze features",
      "Ad-free viewing",
    ],
    plan: "silver",
  },
  {
    name: "Gold",
    price: 499,
    color: "#FFD600",
    textColor: "#263238",
    features: [
      "Unlimited downloads",
      "All Silver features",
      "Exclusive content",
      "Early access to features",
    ],
    plan: "gold",
  },
];

function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const handleUpgrade = async (plan) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (plan.plan === "free") return;

    setLoading(plan.plan);
    setError("");

    try {
      // Create order
      const orderRes = await createOrder({ plan: plan.plan });
      const { orderId, amount, currency, keyId } = orderRes.data;

      // Open Razorpay payment popup
      const options = {
        key: keyId,
        amount,
        currency,
        name: "YouTube Clone",
        description: `${plan.name} Plan - 1 Month`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              plan: plan.plan,
            });

            navigate("/payment-success", {
              state: {
                plan: plan.name,
                amount: plan.price,
                transactionId: response.razorpay_payment_id,
              },
            });
         } catch {
            setError("Payment verification failed. Please contact support.");
        }
        },
        prefill: {
          name: user.username,
          email: user.email || "",
        },
        theme: {
          color: plan.color,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h2>Choose Your Plan</h2>
        <p>Upgrade to unlock more features</p>
        {user && (
          <p className="current-plan">
            Current Plan: <strong>{user.plan?.toUpperCase() || "FREE"}</strong>
          </p>
        )}
      </div>

      {error && <p className="pricing-error">{error}</p>}

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div
            key={plan.plan}
            className={`pricing-card ${user?.plan === plan.plan ? "current" : ""}`}
          >
            <div
              className="pricing-card-header"
              style={{ background: plan.color, color: plan.textColor }}
            >
              <h3>{plan.name}</h3>
              <p className="pricing-price">
                {plan.price === 0 ? "Free" : `₹${plan.price}/mo`}
              </p>
            </div>

            <div className="pricing-card-body">
              <ul className="pricing-features">
                {plan.features.map((feature, index) => (
                  <li key={index}>✅ {feature}</li>
                ))}
              </ul>

              {user?.plan === plan.plan ? (
                <button className="pricing-btn current-btn" disabled>
                  Current Plan
                </button>
              ) : plan.plan === "free" ? (
                <button className="pricing-btn free-btn" disabled>
                  Default Plan
                </button>
              ) : (
                <button
                  className="pricing-btn upgrade-btn"
                  onClick={() => handleUpgrade(plan)}
                  disabled={loading === plan.plan}
                >
                  {loading === plan.plan ? "Processing..." : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PricingPage;