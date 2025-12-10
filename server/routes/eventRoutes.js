const express = require('express');
const router = express.Router();
const { 
    createEvent, 
    getAllEvents, 
    getEventById, 
    rsvpEvent, 
    deleteEvent 
} = require('../controllers/eventController');
const auth = require('../middleware/authMiddleware');

router.post('/create', auth, createEvent);
router.get('/all', auth, getAllEvents);
router.get('/:id', auth, getEventById);     // Get details
router.put('/rsvp/:id', auth, rsvpEvent);   // The toggle route
router.delete('/:id', auth, deleteEvent);

module.exports = router;