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
          socket.emit('error', 'No permission to access this document');
          return;
        }

        socket.join(documentId);
        socket.to(documentId).emit('user-joined', userId);
        socket.emit('document-content', document.content);

      } catch (err) {
        socket.emit('error', 'Error joining document');
        console.error(err);
      }
    });

    socket.on('text-change', async ({ documentId, userId, content }) => {
      try {
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
          socket.emit('error', 'No permission to edit this document');
          return;
        }

        document.content = content;
        await document.save();
        socket.to(documentId).emit('text-update', { userId, content });

      } catch (err) {
        socket.emit('error', 'Error updating document');
        console.error(err);
      }
    });

    socket.on('user-presence', ({ documentId, userId, isActive }) => {
      socket.to(documentId).emit('user-presence-update', { userId, isActive });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { setupSocket, getIO };