const User = require('../models/User');
const Job = require('../models/Job'); 
const Mentorship = require('../models/Mentorship'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); 

// 1. REGISTER LOGIC (Fixed for Speed & Retry)
exports.register = async (req, res) => {
    try {
        const { 
            name, email, password, role, 
            department, batch, rollNumber, currentCompany, jobRole 
        } = req.body;

        // --- A. DOMAIN VALIDATION ---
        if (!email.endsWith('@kgcas.com')) {
            return res.status(400).json({ message: "Registration restricted to @kgcas.com emails only." });
        }

        let user = await User.findOne({ email });

        // --- B. CHECK EXISTING USER ---
        if (user) {
            // If user is already verified, block them (Account actually exists)
            if (user.isVerified) {
                return res.status(400).json({ message: "User already exists. Please Login." });
            }
            // If user exists but is NOT verified, we allow Re-Registration (Overwrite old data)
            // This fixes the "User already exists" issue when user leaves and comes back
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-Digit PIN

        if (user && !user.isVerified) {
            // --- UPDATE EXISTING UNVERIFIED USER ---
            user.name = name;
            user.password = hashedPassword;
            user.role = role;
            user.department = department;
            user.batch = batch;
            user.verificationToken = otp; // Update with NEW OTP
            // Update conditional fields
            user.rollNumber = role === 'Student' ? rollNumber : undefined;
            user.currentCompany = role === 'Alumni' ? currentCompany : undefined;
            user.jobRole = role === 'Alumni' ? jobRole : undefined;
            
            await user.save();
        } else {
            // --- CREATE NEW USER ---
            user = new User({
                name, email, password: hashedPassword, role,
                isApproved: false, 
                isVerified: false,
                verificationToken: otp,
                department, batch, 
                rollNumber: role === 'Student' ? rollNumber : undefined,
                currentCompany: role === 'Alumni' ? currentCompany : undefined,
                jobRole: role === 'Alumni' ? jobRole : undefined
            });
            await user.save();
        }

        // --- C. SEND OTP EMAIL (Background Process) ---
        // Removed 'await' so frontend gets instant response
        sendEmail(
            user.email, 
            "Your Verification PIN - AlumniConnect", 
            `Your Verification PIN is: ${otp}\n\nGo back to the app and enter this code to verify your account.`
        ).catch(err => console.error("Email send failed:", err));

        // Respond immediately (Speed Fix)
        res.status(201).json({ message: "OTP sent to your email!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. VERIFY OTP LOGIC
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "User not found" });

        // Check PIN
        if (user.verificationToken !== otp) {
            return res.status(400).json({ message: "Invalid PIN" });
        }

        user.isVerified = true;
        user.verificationToken = undefined; 
        await user.save();

        res.status(200).json({ message: "Verified Successfully! You can now login." });

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

        // Check Verification
        if (!user.isVerified) {
            return res.status(400).json({ message: "Email not verified. Please verify your OTP." });
        }

        // Check Admin Approval
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

// 11. REJECT USER (Delete from DB)
exports.rejectUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User rejected and removed successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
// --- GET ALL STUDENTS WITH FILTERS ---
exports.getAllStudents = async (req, res) => {
    try {
        const { search, department, batch, sort } = req.query;

        // 1. Base Query: Only get 'Student' role
        let query = { role: 'Student' };

        // 2. Search Logic (Name, Email, or Roll Number)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },       // Case-insensitive name
                { email: { $regex: search, $options: 'i' } },      // Case-insensitive email
                { rollNumber: { $regex: search, $options: 'i' } }  // Roll number match
            ];
        }

        // 3. Filter by Department
        if (department && department !== 'All') {
            query.department = department;
        }

        // 4. Filter by Batch (Year)
        if (batch && batch !== 'All') {
            query.batch = batch;
        }

        // 5. Execute Query
        // Sort logic: 'newest' (default) or 'oldest' or 'name'
        let sortOption = { createdAt: -1 }; // Default: Newest first
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'name') sortOption = { name: 1 };

        const students = await User.find(query)
            .select('-password') // Hide password
            .sort(sortOption);

        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};