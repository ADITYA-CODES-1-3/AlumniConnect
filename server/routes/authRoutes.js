const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Import Security Guard

// Import Controller Functions
const { 
    register, 
    login, 
    verifyOtp,      // <--- NEW: Import the OTP verification function
    getPendingUsers, 
    approveUser, 
    getAllUsers, 
    getAdminStats, 
    getProfile, 
    updateProfile 
} = require('../controllers/authController');

// --- PUBLIC ROUTES (No Login Required) ---
router.post('/register', register);       // Step 1: Submit Details -> Get OTP
router.post('/verify-otp', verifyOtp);    // Step 2: Submit OTP -> Verify Account <--- NEW ROUTE
router.post('/login', login);             // Step 3: Login (Checks if verified & approved)

// --- PROTECTED ROUTES (Token Required) ---

// Profile Management
router.get('/me', auth, getProfile);          // Get logged in user's profile
router.put('/me/update', auth, updateProfile); // Update logged in user's profile

// Admin / Directory Features
// (Note: In a real app, you should add 'auth' middleware to these too!)
router.get('/users', getAllUsers);
router.get('/pending-users', getPendingUsers);
router.put('/approve/:id', approveUser);
router.get('/stats', getAdminStats);

module.exports = router;