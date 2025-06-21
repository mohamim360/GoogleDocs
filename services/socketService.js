const socketIO = require('socket.io');
const Document = require('../models/Document');
const SharedDocument = require('../models/SharedDocument');

let io;

const setupSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a document room
    socket.on('join-document', async ({ documentId, userId }) => {
      try {
        // Verify user has access to the document
        const document = await Document.findById(documentId);
        if (!document) {
          socket.emit('error', 'Document not found');
          return;
        }

        const isOwner = document.owner.equals(userId);
        const isShared = await SharedDocument.findOne({
          document: documentId,
          user: userId
        });

        if (!isOwner && !isShared) {
          socket.emit('error', 'You do not have permission to access this document');
          return;
        }

        socket.join(documentId);
        console.log(`User ${userId} joined document ${documentId}`);

        // Notify others in the room about the new user
        socket.to(documentId).emit('user-joined', userId);

        // Send current document content to the new user
        socket.emit('document-content', document.content);

      } catch (err) {
        socket.emit('error', 'Error joining document');
        console.error(err);
      }
    });

    // Handle text changes
    socket.on('text-change', async ({ documentId, userId, content }) => {
      try {
        // Verify user has edit permission
        const document = await Document.findById(documentId);
        if (!document) {
          socket.emit('error', 'Document not found');
          return;
        }

        const isOwner = document.owner.equals(userId);
        const isEditor = await SharedDocument.findOne({
          document: documentId,
          user: userId,
          permission: 'editor'
        });

        if (!isOwner && !isEditor) {
          socket.emit('error', 'You do not have permission to edit this document');
          return;
        }

        // Update document in database
        document.content = content;
        await document.save();

        // Broadcast changes to all other clients in the room
        socket.to(documentId).emit('text-update', { userId, content });

      } catch (err) {
        socket.emit('error', 'Error updating document');
        console.error(err);
      }
    });

    // Handle user presence
    socket.on('user-presence', ({ documentId, userId, isActive }) => {
      socket.to(documentId).emit('user-presence-update', { userId, isActive });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  setupSocket,
  getIO
};