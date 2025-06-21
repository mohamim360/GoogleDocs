const socketIO = require("socket.io");
const Document = require("../models/Document");
const SharedDocument = require("../models/SharedDocument");

let io;

const setupSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "https://google-docs-frontend-chi.vercel.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-document", ({ documentId, userId }) => {
      socket.join(documentId);
      console.log(`User ${userId} joined document ${documentId}`);

      // Notify others in the room
      socket.to(documentId).emit("user-joined", userId);
    });

    socket.on("text-change", async ({ documentId, userId, content }) => {
      try {
        // Update database
        await Document.findByIdAndUpdate(documentId, { content });

        // Broadcast to others in the room
        socket.to(documentId).emit("text-update", {
          userId,
          content,
        });
      } catch (err) {
        console.error("Error updating document:", err);
      }
    });

    socket.on("cursor-update", ({ documentId, userId, position }) => {
      socket.to(documentId).emit("cursor-update", {
        userId,
        position,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { setupSocket, getIO };
