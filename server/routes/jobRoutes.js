const express = require('express');
const router = express.Router();
const { postJob, getAllJobs, getJobById } = require('../controllers/jobController');
const auth = require('../middleware/authMiddleware'); 

// Protected Routes
router.post('/create', auth, postJob); 
router.get('/all', auth, getAllJobs);  

// Public Routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

module.exports = router;