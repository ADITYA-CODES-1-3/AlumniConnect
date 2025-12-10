const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true }, // Stores ISO string from frontend
    time: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Webinar', 'Workshop', 'Meetup', 'Hackathon', 'Reunion', 'Seminar'],
        default: 'Webinar' 
    },
    banner: { type: String }, // Base64 string for image
    totalSeats: { type: Number, required: true },
    
    // Who created the event
    organizer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    // List of students/users who RSVP'd
    attendees: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);