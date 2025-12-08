const Mentorship = require('../models/Mentorship');
const User = require('../models/User');

// 1. Send Mentorship Request
exports.sendRequest = async (req, res) => {
    try {
        const { alumniId, message } = req.body;
        const studentId = req.user.id;

        // --- LOGIC FIX 1: SELF REQUEST BLOCK ---
        if (studentId === alumniId) {
            return res.status(400).json({ message: "You cannot request mentorship from yourself!" });
        }

        // Check Duplicates
        const existing = await Mentorship.findOne({ studentId, alumniId });
        if (existing) return res.status(400).json({ message: "Request already sent!" });

        const newRequest = new Mentorship({ studentId, alumniId, message });
        await newRequest.save();

        res.status(201).json({ message: "Mentorship Request Sent!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Get My Requests (For Alumni)
// 2. Get My Requests (For Both Student & Alumni)
exports.getMyRequests = async (req, res) => {
    try {
        // Find all requests where the user is EITHER the student (sender) OR the alumni (receiver)
        const requests = await Mentorship.find({
            $or: [
                { alumniId: req.user.id },
                { studentId: req.user.id }
            ]
        })
        .populate('studentId', 'name email department profileImage') // Get Student Details
        .populate('alumniId', 'name currentCompany jobRole profileImage'); // Get Alumni Details

        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. Update Status (Accept/Reject)
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Mentorship.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: `Request ${status}` });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. Remove Connection (Delete Request)
exports.removeConnection = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find and Delete
        const deletedRequest = await Mentorship.findByIdAndDelete(id);
        
        if (!deletedRequest) {
            return res.status(404).json({ message: "Connection not found" });
        }

        res.json({ message: "Connection Removed Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};