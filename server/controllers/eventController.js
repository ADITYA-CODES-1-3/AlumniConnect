const Event = require('../models/Event');
const User = require('../models/User');

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { title, description, location, date, time, totalSeats, category, banner } = req.body;
        
        const newEvent = new Event({
            title, description, location, date, time, totalSeats, category, banner,
            organizer: req.user.id 
        });

        await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (error) {
        res.status(500).json({ message: "Error creating event", error: error.message });
    }
};

// Get All Events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizer', 'name email role')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Error fetching events" });
    }
};

// Get Single Event (Detailed)
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email')
            .populate('attendees', 'name email role location'); 

        if (!event) return res.status(404).json({ message: "Event not found" });

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: "Error fetching event details" });
    }
};

// --- FIX: ROBUST RSVP TOGGLE LOGIC ---
exports.rsvpEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id; // Comes from auth middleware

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if user is already attending
        // We use .toString() to correctly compare Mongoose ObjectIds with String IDs
        const isAlreadyAttending = event.attendees.some(
            (attendeeId) => attendeeId.toString() === userId
        );

        if (isAlreadyAttending) {
            // --- UNREGISTER LOGIC ---
            // Remove user from the attendees array
            event.attendees = event.attendees.filter(
                (attendeeId) => attendeeId.toString() !== userId
            );
            await event.save();
            return res.json({ message: "Successfully unregistered from the event", status: "unregistered" });
        } else {
            // --- REGISTER LOGIC ---
            // Check for seat availability
            if (event.attendees.length >= event.totalSeats) {
                return res.status(400).json({ message: "Event is fully booked" });
            }

            // Add user to attendees array
            event.attendees.push(userId);
            await event.save();
            return res.json({ message: "Successfully registered for the event!", status: "registered" });
        }
    } catch (error) {
        console.error("RSVP Error:", error); // Logs error to server console for debugging
        res.status(500).json({ message: "Server error during RSVP", error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        if (event.organizer.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await event.deleteOne();
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};