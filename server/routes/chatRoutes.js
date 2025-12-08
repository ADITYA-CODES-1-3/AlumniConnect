const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getMessages } = require('../controllers/chatController');

// GET history between logged-in user and receiverId
router.get('/:receiverId', auth, getMessages);

module.exports = router;