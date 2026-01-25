const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
    sendRequest, 
    getMyRequests, 
    updateStatus, 
    removeConnection,
    getAllMentors // <--- Make sure this is here
} = require('../controllers/mentorshipController'); 

// Define Routes
router.post('/request', auth, sendRequest);
router.get('/my-requests', auth, getMyRequests);
router.put('/update/:id', auth, updateStatus);
router.delete('/remove/:id', auth, removeConnection);
router.get('/mentors', getAllMentors); // This line caused the error before because the function was missing

module.exports = router;