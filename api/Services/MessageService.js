const Message = require("../Models/Message");
const User = require("../Models/User");
const Channel = require("../Models/Channel");
const DirectMessage = require("../Models/DirectMessages");

/**
 * Creates a new message in either a channel or a direct message (DM).
 * @async
 * @function createMessage
 * @param {Object} params - The message details.
 * @param {string} params.content - The message content.
 * @param {Date} [params.timestamp=new Date()] - The time the message was sent.
 * @param {number} params.sender_id - The ID of the sender.
 * @param {number|null} [params.dm_id=null] - The DM session ID if sending a direct message.
 * @param {number|null} [params.channel_id=null] - The channel ID if sending to a channel.
 * @returns {Promise<Object>} The created message object.
 * @throws {Error} Throws if required parameters are missing or creation fails.
 */
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

/**
 * Retrieves all messages from a specific channel.
 * @async
 * @function getMessagesByChannel
 * @param {number} channelId - The channel ID.
 * @returns {Promise<Array>} An array of message objects with sender data.
 * @throws {Error} Throws if retrieval fails.
 */
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

/**
 * Retrieves all messages from a specific direct message (DM) session.
 * @async
 * @function getMessagesByDM
 * @param {number} dmId - The DM session ID.
 * @returns {Promise<Array>} An array of message objects with sender data.
 * @throws {Error} Throws if retrieval fails.
 */
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

/**
 * Retrieves all messages sent by a specific user.
 * @async
 * @function getMessagesByUser
 * @param {number} userId - The user ID.
 * @returns {Promise<Array>} An array of message objects with channel/DM info.
 * @throws {Error} Throws if retrieval fails.
 */
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

/**
 * Deletes a message by its ID.
 * @async
 * @function deleteMessage
 * @param {number} messageId - The ID of the message to delete.
 * @returns {Promise<Object>} A success message.
 * @throws {Error} Throws if message not found or deletion fails.
 */
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

/**
 * Updates a message's content by its ID.
 * @async
 * @function updateMessage
 * @param {number} messageId - The ID of the message to update.
 * @param {string} newContent - The new content for the message.
 * @returns {Promise<Object>} The updated message object.
 * @throws {Error} Throws if message not found or update fails.
 */
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
