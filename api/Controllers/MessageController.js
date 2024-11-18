const messageService = require("../Services/MessageService");

// Controller to create a new message (either for a channel or a DM)
const createMessage = async (req, res) => {
    const { content, senderId, channelId, dmId } = req.body;

    if (!content || !senderId || (!channelId && !dmId) || (channelId && dmId)) {
        return res.status(400).json({
            error: "Content, sender ID, and either channel ID or DM ID (but not both) are required",
        });
    }

    try {
        const message = await messageService.createMessage({
            content,
            sender_id: senderId,
            channel_id: channelId || null,
            dm_id: dmId || null,
            timestamp: new Date()
        });

        return res.status(201).json(message);
    } catch (error) {
        console.error("Error in createMessage controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Controller to retrieve messages by channel ID
const getMessagesByChannel = async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        return res.status(400).json({ error: "Channel ID is required" });
    }

    try {
        const messages = await messageService.getMessagesByChannel(channelId);
        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessagesByChannel controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Controller to retrieve messages by DM ID
const getMessagesByDM = async (req, res) => {
    const { dmId } = req.params;

    if (!dmId) {
        return res.status(400).json({ error: "DM ID is required" });
    }

    try {
        const messages = await messageService.getMessagesByDM(dmId);
        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessagesByDM controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Controller to retrieve messages by user (sender ID)
const getMessagesByUser = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const messages = await messageService.getMessagesByUser(userId);
        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessagesByUser controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Controller to delete a message by ID
const deleteMessage = async (req, res) => {
    const { messageId } = req.params;

    if (!messageId) {
        return res.status(400).json({ error: "Message ID is required" });
    }

    try {
        const response = await messageService.deleteMessage(messageId);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in deleteMessage controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Controller to update a message by ID
const updateMessage = async (req, res) => {
    const { messageId } = req.params;
    const { newContent } = req.body;

    if (!messageId || !newContent) {
        return res.status(400).json({ error: "Message ID and new content are required" });
    }

    try {
        const message = await messageService.updateMessage(messageId, newContent);
        return res.status(200).json(message);
    } catch (error) {
        console.error("Error in updateMessage controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};



module.exports = {
    createMessage,
    getMessagesByChannel,
    getMessagesByDM,
    getMessagesByUser,
    deleteMessage,
    updateMessage,
};
