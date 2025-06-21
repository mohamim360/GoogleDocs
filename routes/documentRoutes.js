const express = require('express');

const documentController = require('../controllers/documentController');
const { authenticate } = require('../utils/authUtils');

const router = express.Router();

// Protect all routes after this middleware
router.use(authenticate);

router.route('/')
  .get(documentController.getAllDocuments)
  .post(documentController.createDocument);

router.route('/:id')
  .get(documentController.getDocument)
  .patch(documentController.updateDocument)
  .delete(documentController.deleteDocument);

router.post('/:id/share', documentController.shareDocument);

module.exports = router;