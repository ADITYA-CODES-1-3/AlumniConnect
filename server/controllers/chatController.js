const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.id;

        // Find messages between these two users (sent OR received)
        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ timestamp: 1 }); // Sort oldest to newest

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};