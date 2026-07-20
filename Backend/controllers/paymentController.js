import crypto from "crypto";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

const PLAN_PRICES = {
  bronze: 9900,
  silver: 19900,
  gold: 49900,
};

const PLAN_EXPIRY_DAYS = 30;

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { default: Razorpay } = await import("razorpay");
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { plan } = req.body;

    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const options = {
      amount: PLAN_PRICES[plan],
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      user: req.user.id,
      razorpayOrderId: order.id,
      plan,
      amount: PLAN_PRICES[plan] / 100,
      status: "created",
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err); // NEW: log full error to terminal
    res.status(500).json({ message: err.message });
  }
};

// Verify payment and update plan
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: "paid",
        paidAt: new Date(),
      }
    );

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + PLAN_EXPIRY_DAYS);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        plan,
        planExpiry: expiry,
        transactionId: razorpayPaymentId,
      },
      { new: true }
    );

    await sendEmail({
      to: user.email,
      subject: `✅ Payment Successful — ${plan.toUpperCase()} Plan Activated`,
    });

    res.json({
      message: "Payment verified successfully",
      plan,
      planExpiry: expiry,
      transactionId: razorpayPaymentId,
    });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err); // NEW: log full error to terminal
    res.status(500).json({ message: err.message });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    console.error("GET PAYMENT HISTORY ERROR:", err); // NEW: log full error to terminal
    res.status(500).json({ message: err.message });
  }
};