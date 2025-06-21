const mongoose = require('mongoose');

const sharedDocumentSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permission: {
    type: String,
    enum: ['viewer', 'editor'],
    default: 'viewer'
  },
  sharedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SharedDocument', sharedDocumentSchema);