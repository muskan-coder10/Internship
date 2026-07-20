

const rooms = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Room join karna
    socket.on("join-room", ({ roomId, username }) => {
      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      rooms[roomId].push({ socketId: socket.id, username });

      io.to(roomId).emit("participants-updated", rooms[roomId]);

      console.log(`${username} joined room ${roomId}`);
    });

    // Chat message
    socket.on("chat-message", ({ roomId, username, message }) => {
      io.to(roomId).emit("chat-message", {
        username,
        message,
        time: new Date().toLocaleTimeString(),
      });
    });

    // Video sync — play
    socket.on("video-play", ({ roomId, currentTime }) => {
      socket.to(roomId).emit("video-play", { currentTime });
    });

    // Video sync — pause
    socket.on("video-pause", ({ roomId, currentTime }) => {
      socket.to(roomId).emit("video-pause", { currentTime });
    });

    // Video sync — seek
    socket.on("video-seek", ({ roomId, currentTime }) => {
      socket.to(roomId).emit("video-seek", { currentTime });
    });

    // WebRTC signaling
    socket.on("webrtc-offer", ({ offer, to }) => {
      io.to(to).emit("webrtc-offer", { offer, from: socket.id });
    });

    socket.on("webrtc-answer", ({ answer, to }) => {
      io.to(to).emit("webrtc-answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    // Room leave karna
    socket.on("leave-room", ({ roomId, username }) => {
      socket.leave(roomId);

      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(
          (p) => p.socketId !== socket.id
        );
        io.to(roomId).emit("participants-updated", rooms[roomId]);
      }

      console.log(`${username} left room ${roomId}`);
    });

    // Disconnect
    socket.on("disconnect", () => {
      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter(
          (p) => p.socketId !== socket.id
        );
        io.to(roomId).emit("participants-updated", rooms[roomId]);
      }
      console.log("User disconnected:", socket.id);
    });
  });
};

export default socketHandler;