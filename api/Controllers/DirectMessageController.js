const directMessageService = require("../Services/DirectMessageService");

// Controller to create or retrieve a DM session between two users
const createOrGetDirectMessage = async (req, res) => {
    const { user1_id, user2_id } = req.body;

    if (!user1_id || !user2_id) {
        return res.status(400).json({ error: "Both user1_id and user2_id are required" });
    }

    try {
        const directMessage = await directMessageService.createOrGetDirectMessage(user1_id, user2_id);
        return res.status(200).json(directMessage);
    } catch (error) {
        console.error("Error in createOrGetDirectMessage controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Controller to get all DM sessions for a user
const getDirectMessagesByUser = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const directMessages = await directMessageService.getDirectMessagesByUser(userId);
        return res.status(200).json(directMessages);
    } catch (error) {
        console.error("Error in getDirectMessagesByUser controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createOrGetDirectMessage,
    getDirectMessagesByUser,
};
