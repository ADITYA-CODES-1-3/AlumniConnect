const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Student', 'Alumni', 'Admin'], 
        default: 'Student' 
    },
    
    // --- NEW VERIFICATION FIELDS ---
    isVerified: { type: Boolean, default: false }, // Starts as false
    verificationToken: { type: String },           // Stores the secret code
    
    isApproved: { type: Boolean, default: false }, // Admin approval flag
    
    // IMAGE STORAGE (Base64 String)
    profileImage: { 
        type: String, 
        default: "" 
    },

    // Registration Details
    department: { type: String, required: true },
    batch: { type: String, required: true },
    rollNumber: { type: String },                 
    currentCompany: { type: String },             
    jobRole: { type: String },

    // --- PROFILE FIELDS ---
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] }, 
    about: { type: String, default: '' },
    location: { type: String, default: '' },
    socialLinks: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        website: { type: String, default: '' }
    }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);