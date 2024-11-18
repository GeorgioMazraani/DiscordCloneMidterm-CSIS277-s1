const Message = require("../Models/Message");
const User = require("../Models/User");
const Channel = require("../Models/Channel");
const DirectMessage = require("../Models/DirectMessages");
const createMessage = async ({ content, timestamp, sender_id, dm_id = null, channel_id = null }) => {
    if (!content || typeof content !== "string" || content.trim() === "") {
        throw new Error("Content must be a non-empty string.");
    }

    if (!sender_id) {
        throw new Error("Sender ID cannot be null.");
    }

    if (!dm_id && !channel_id) {
        throw new Error("Either dm_id or channel_id must be provided.");
    }

    try {
        const message = await Message.create({
            content: content.trim(),
            timestamp: timestamp || new Date(),
            sender_id,
            channel_id: channel_id || null,
            dm_id: dm_id || null
        });

        return message;
    } catch (error) {
        console.error("Error creating message:", error);
        throw new Error("Failed to create message");
    }
};

const getMessagesByChannel = async (channelId) => {
    try {
        const messages = await Message.findAll({
            where: { channel_id: channelId },
            include: [
                {
                    model: User,
                    as: "Sender",
                    attributes: ["id", "username", "email"],
                }
            ],
            order: [["timestamp", "ASC"]],
        });
        return messages;
    } catch (error) {
        console.error("Error retrieving messages by channel:", error);
        throw new Error("Failed to retrieve messages");
    }
};

const getMessagesByDM = async (dmId) => {
    try {
        const messages = await Message.findAll({
            where: { dm_id: dmId },
            include: [
                {
                    model: User,
                    as: "Sender",
                    attributes: ["id", "username"],
                },
            ],
            order: [["timestamp", "ASC"]],
        });
        return messages;
    } catch (error) {
        console.error("Error retrieving messages by DM:", error);
        throw new Error("Failed to retrieve messages");
    }
};

const getMessagesByUser = async (userId) => {
    try {
        const messages = await Message.findAll({
            where: { sender_id: userId },
            include: [
                {
                    model: Channel,
                    as: "Channel",
                    attributes: ["id", "name"],
                },
                {
                    model: DirectMessage,
                    as: "DirectMessage",
                    attributes: ["id"],
                }
            ],
            order: [["timestamp", "ASC"]],
        });
        return messages;
    } catch (error) {
        console.error("Error retrieving messages by user:", error);
        throw new Error("Failed to retrieve messages");
    }
};

const deleteMessage = async (messageId) => {
    try {
        const result = await Message.destroy({ where: { id: messageId } });
        if (result === 0) {
            throw new Error("Message not found");
        }
        return { message: "Message deleted successfully" };
    } catch (error) {
        console.error("Error deleting message:", error);
        throw new Error("Failed to delete message");
    }
};
const updateMessage = async (messageId, newContent) => {
    try {
        const message = await Message.findByPk(messageId);
        if (!message) {
            throw new Error("Message not found");
        }
        message.content = newContent;
        await message.save();
        return message;
    } catch (error) {
        console.error("Error updating message:", error);
        throw new Error("Failed to update message");
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
