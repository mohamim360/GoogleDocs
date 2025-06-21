const Document = require('../models/Document');
const SharedDocument = require('../models/SharedDocument');
const User = require('../models/User');
const AppError = require('../utils/appError');

exports.createDocument = async (req, res, next) => {
  try {
    const { title } = req.body;
    
    const document = await Document.create({
      title,
      owner: req.user._id
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        document
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllDocuments = async (req, res, next) => {
  try {
    // Get documents owned by the user
    const ownedDocuments = await Document.find({ owner: req.user._id });
    
    // Get documents shared with the user
    const sharedDocuments = await SharedDocument.find({ user: req.user._id })
      .populate('document')
      .populate('user', 'name email avatar');
    
    res.status(200).json({
      status: 'success',
      data: {
        ownedDocuments,
        sharedDocuments
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    
    // Check if user is owner or has shared access
    const isOwner = document.owner.equals(req.user._id);
    const isShared = await SharedDocument.findOne({
      document: req.params.id,
      user: req.user._id
    });
    
    if (!isOwner && !isShared) {
      return next(new AppError('You do not have permission to access this document', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        document
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    
    // Check if user is owner or has editor access
    const isOwner = document.owner.equals(req.user._id);
    const isEditor = await SharedDocument.findOne({
      document: req.params.id,
      user: req.user._id,
      permission: 'editor'
    });
    
    if (!isOwner && !isEditor) {
      return next(new AppError('You do not have permission to edit this document', 403));
    }
    
    if (title) document.title = title;
    if (content) document.content = content;
    
    await document.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        document
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    
    // Only owner can delete
    if (!document.owner.equals(req.user._id)) {
      return next(new AppError('Only the owner can delete this document', 403));
    }
    
    await document.remove();
    
    // Also delete all shared access records
    await SharedDocument.deleteMany({ document: req.params.id });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

exports.shareDocument = async (req, res, next) => {
  try {
    const { email, permission } = req.body;
    const documentId = req.params.id;
    
    const document = await Document.findById(documentId);
    
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    
    // Only owner can share
    if (!document.owner.equals(req.user._id)) {
      return next(new AppError('Only the owner can share this document', 403));
    }
    
    const userToShareWith = await User.findOne({ email });
    
    if (!userToShareWith) {
      return next(new AppError('No user found with that email', 404));
    }
    
    // Can't share with yourself
    if (userToShareWith._id.equals(req.user._id)) {
      return next(new AppError('You cannot share a document with yourself', 400));
    }
    
    // Check if already shared
    const alreadyShared = await SharedDocument.findOne({
      document: documentId,
      user: userToShareWith._id
    });
    
    if (alreadyShared) {
      return next(new AppError('This document is already shared with this user', 400));
    }
    
    const sharedDoc = await SharedDocument.create({
      document: documentId,
      user: userToShareWith._id,
      permission: permission || 'viewer'
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        sharedDocument: sharedDoc
      }
    });
  } catch (err) {
    next(err);
  }
};