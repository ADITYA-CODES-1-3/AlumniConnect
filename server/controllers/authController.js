const User = require('../models/User');
const Job = require('../models/Job'); 
const Mentorship = require('../models/Mentorship'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// 1. REGISTER (Step 1: Save User & Send OTP)
exports.register = async (req, res) => {
    try {
        const { 
            name, email, password, role, 
            department, batch, rollNumber, currentCompany, jobRole 
        } = req.body;

        // Domain Check
        if (!email.endsWith('@kgcas.com')) {
            return res.status(400).json({ message: "Only @kgcas.com emails allowed." });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- GENERATE 4-DIGIT PIN ---
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); 

        user = new User({
            name, email, password: hashedPassword, role,
            isApproved: false,
            isVerified: false, // User is created but LOCKED
            verificationToken: otp, // Store the PIN temporarily
            department, batch, 
            rollNumber: role === 'Student' ? rollNumber : undefined,
            currentCompany: role === 'Alumni' ? currentCompany : undefined,
            jobRole: role === 'Alumni' ? jobRole : undefined
        });

        await user.save();

        // Send Email
        await sendEmail(
            user.email, 
            "Your Verification PIN", 
            `Your 4-digit verification PIN is: ${otp}`
        );

        res.status(200).json({ message: "OTP sent to your email!" });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. VERIFY OTP (Step 2: Unlock User)
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Check PIN
        if (user.verificationToken !== otp) {
            return res.status(400).json({ message: "Invalid PIN. Try again." });
        }

        // Verify Success
        user.isVerified = true;
        user.verificationToken = undefined; // Remove PIN
        await user.save();

        res.status(200).json({ message: "Email Verified! Waiting for Admin Approval." });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. LOGIN LOGIC
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        // Check Verification First
        if (!user.isVerified) {
            return res.status(400).json({ message: "Please verify your email first." });
        }

        if (user.isApproved === false) {
            return res.status(403).json({ message: "Your account is pending Admin approval." });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            token, 
            user: { 
                id: user._id, name: user.name, role: user.role,
                department: user.department, profileImage: user.profileImage
            } 
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// 4. GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const jobCount = await Job.countDocuments() || 0;
        let stats = {};

        if (role === 'Student') {
            const myMentorships = await Mentorship.countDocuments({ studentId: userId });
            stats = {
                card1: { label: "Active Jobs", value: jobCount },
                card2: { label: "My Mentorships", value: myMentorships },
                card3: { label: "Events", value: 3 }
            };
        } else if (role === 'Alumni') {
            const studentCount = await User.countDocuments({ role: 'Student' });
            stats = {
                card1: { label: "Total Students", value: studentCount },
                card2: { label: "Active Jobs", value: jobCount },
                card3: { label: "Events", value: 3 }
            };
        } else {
            const userCount = await User.countDocuments();
            stats = {
                card1: { label: "Total Users", value: userCount },
                card2: { label: "Total Jobs", value: jobCount },
                card3: { label: "Pending Approvals", value: 0 }
            };
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 5. UPDATE PROFILE
exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, skills, about, location, socialLinks, department, batch, rollNumber, currentCompany, jobRole, profileImage } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                $set: { 
                    name, bio, skills, about, location, socialLinks,
                    department, batch, rollNumber, currentCompany, jobRole,
                    profileImage 
                } 
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ message: "Profile Updated Successfully!", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 6. GET MY PROFILE
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 7. GET ALL USERS (Directory & Single Profile)
exports.getAllUsers = async (req, res) => {
    try {
        const { role, id } = req.query; 
        
        let query = {};
        
        // If searching for a specific user ID (Profile View)
        if (id) {
            query._id = id;
        } 
        // If searching by role (Directory View)
        else if (role) {
            query.role = role;
        }

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 8. GET PENDING USERS (Admin)
exports.getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ isApproved: false }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 9. APPROVE USER (Admin)
exports.approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.isApproved = true;
        await user.save();
        res.json({ message: "User approved successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 10. GET ADMIN STATS
exports.getAdminStats = async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'Student' });
        const alumniCount = await User.countDocuments({ role: 'Alumni' });
        const pendingCount = await User.countDocuments({ isApproved: false });
        res.json({ students: studentCount, alumni: alumniCount, pending: pendingCount });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};