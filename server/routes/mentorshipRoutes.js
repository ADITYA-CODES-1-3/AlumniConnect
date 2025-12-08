const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { sendRequest, getMyRequests, updateStatus ,removeConnection } = require('../controllers/mentorshipController'); // IMPORT CHECK

// Define Routes
router.post('/request', auth, sendRequest);
router.get('/my-requests', auth, getMyRequests);
router.put('/update/:id', auth, updateStatus);
router.delete('/remove/:id', auth, removeConnection);

module.exports = router;