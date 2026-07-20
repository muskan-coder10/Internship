import User from "../models/User.js";
import OTP from "../models/OTP.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const getThemeByTime = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const hours = istTime.getUTCHours();
  return hours >= 10 && hours < 12 ? "light" : "dark";
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getLocationFromIP = async (ip) => {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return {
      city: data.city || "",
      state: data.region || "",
    };
  } catch {
    return { city: "", state: "" };
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const theme = getThemeByTime();

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      channelName: username,
      theme,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      theme: user.theme,
      plan: user.plan,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const deviceId = req.headers["user-agent"] || "";
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    const { city, state } = await getLocationFromIP(ip);

    const isNewLocation = user.lastCity && city && user.lastCity !== city;
    const isNewDevice = user.lastDevice && deviceId && user.lastDevice !== deviceId;

    if (isNewLocation || isNewDevice) {
      const otp = generateOTP();
      await OTP.deleteMany({ user: user._id });
      await OTP.create({
        user: user._id,
        otp,
        email: user.email,
        purpose: isNewLocation ? "new-location" : "new-device",
      });

      await sendEmail({
        to: user.email,
        subject: "Security Alert — OTP Verification Required",
        html: `
          <h2>New Login Detected</h2>
          <p>OTP: <strong>${otp}</strong></p>
          <p>Expires in 10 minutes.</p>
        `,
      });

      return res.json({
        requiresOTP: true,
        userId: user._id,
        message: `OTP sent to ${user.email}`,
      });
    }

    const theme = getThemeByTime();
    await User.findByIdAndUpdate(user._id, {
      theme,
      lastCity: city || user.lastCity,
      lastState: state || user.lastState,
      lastDevice: deviceId,
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      theme,
      plan: user.plan,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const otpRecord = await OTP.findOne({ user: userId, verified: false });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired. Please login again." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await OTP.findByIdAndUpdate(otpRecord._id, { verified: true });

    const user = await User.findById(userId);
    const theme = getThemeByTime();

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    const { city, state } = await getLocationFromIP(ip);
    const deviceId = req.headers["user-agent"] || "";

    await User.findByIdAndUpdate(userId, {
      theme,
      lastCity: city || user.lastCity,
      lastState: state || user.lastState,
      lastDevice: deviceId,
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      theme,
      plan: user.plan,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    if (!["light", "dark"].includes(theme)) {
      return res.status(400).json({ message: "Invalid theme" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { theme },
      { new: true }
    ).select("-password");
    res.json({ theme: user.theme });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password -email"
    );
    if (!user) {
      return res.status(404).json({ message: "Channel not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update avatar
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path },
      { new: true }
    ).select("-password");

    res.json({ avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//signup

export const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, avatar } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      // Naya user banao
      user = await User.create({
        username: name.replace(/\s+/g, "").toLowerCase() + googleId.slice(-4),
        email,
        password: await bcrypt.hash(googleId, 10),
        channelName: name,
        avatar: avatar || "",
        theme: getThemeByTime(),
      });
    }

    const theme = getThemeByTime();
    await User.findByIdAndUpdate(user._id, { theme });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      theme,
      plan: user.plan,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: toggle subscribe/unsubscribe to a channel (channel = a User document)
export const toggleSubscribe = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id; // set by protect middleware

    if (channelId === userId) {
      return res.status(400).json({ message: "You can't subscribe to yourself" });
    }

    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!channel.subscribers) {
      channel.subscribers = [];
    }

    const alreadySubscribed = channel.subscribers.some(
      (subId) => subId.toString() === userId
    );

    if (alreadySubscribed) {
      channel.subscribers = channel.subscribers.filter(
        (subId) => subId.toString() !== userId
      );
    } else {
      channel.subscribers.push(userId);
    }

    await channel.save();

    res.json({
      subscribed: !alreadySubscribed,
      subscriberCount: channel.subscribers.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};