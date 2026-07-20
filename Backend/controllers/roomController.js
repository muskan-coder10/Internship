import Room from "../models/Room.js";
import { v4 as uuidv4 } from "uuid";

// Create a new watch party room
export const createRoom = async (req, res) => {
  try {
    const { videoId, videoTitle, videoThumbnail, youtubeId } = req.body;
    const roomId = uuidv4().slice(0, 8);

    const room = await Room.create({
      roomId,
      host: req.user.id,
      videoId,
      youtubeId,
      videoTitle,
      videoThumbnail,
      participants: [
        {
          userId: req.user.id,
          username: req.user.username,
        },
      ],
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get room info by roomId
export const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Join an existing room
export const joinRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const alreadyJoined = room.participants.some(
      (p) => p.userId.toString() === req.user.id
    );

    if (!alreadyJoined) {
      room.participants.push({
        userId: req.user.id,
        username: req.user.username,
      });
      await room.save();
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Leave a room
export const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.participants = room.participants.filter(
      (p) => p.userId.toString() !== req.user.id
    );

    if (room.participants.length === 0) {
      room.isActive = false;
    }

    await room.save();
    res.json({ message: "Left room successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};