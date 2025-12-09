const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Import Security Guard

// Import Controller Functions
const { 
    register, 
    login, 
    verifyOtp,      
    getPendingUsers, 
    approveUser, 
    rejectUser,     // <--- Ensure this is imported
    getAllUsers, 
    getAdminStats, 
    getProfile, 
    updateProfile 
} = require('../controllers/authController');

// --- PUBLIC ROUTES (No Login Required) ---
router.post('/register', register);       // Step 1: Submit Details -> Get OTP
router.post('/verify-otp', verifyOtp);    // Step 2: Submit OTP -> Verify Account
router.post('/login', login);             // Step 3: Login

// --- PROTECTED ROUTES (Token Required) ---

// Profile Management
router.get('/me', auth, getProfile);          // Get logged in user's profile
router.put('/me/update', auth, updateProfile); // Update logged in user's profile

// --- ADMIN ROUTES ---
// In a real app, these should be protected by 'auth' AND 'adminCheck' middleware
router.get('/users', getAllUsers);
router.get('/pending-users', getPendingUsers);
router.put('/approve/:id', approveUser);
router.delete('/reject/:id', rejectUser); // <--- The Reject Route

router.get('/stats', getAdminStats);

module.exports = router;