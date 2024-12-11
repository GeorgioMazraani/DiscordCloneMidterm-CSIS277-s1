// services/ChannelService.js
const Channel = require("../Models/Channel");
const User = require("../Models/User");
const Message = require("../Models/Message");

/**
 * Creates a new channel in a server.
 * @async
 * @function createChannel
 * @param {string} name - The channel's name.
 * @param {string} type - The channel's type (e.g., 'text' or 'voice').
 * @param {number|null} [serverId=null] - The ID of the server this channel belongs to.
 * @param {boolean} [isPrivate=false] - Whether the channel is private.
 * @returns {Promise<Object>} The created channel object.
 * @throws {Error} Throws if creation fails.
 */
const createChannel = async (name, type, serverId = null, isPrivate = false) => {
    try {
        const newChannel = await Channel.create({
            name,
            type,
            server_id: serverId,
            is_private: isPrivate,
            created_at: new Date(),
            updated_at: new Date(),
        });
        return newChannel;
    } catch (error) {
        console.error("Error creating channel:", error);
        throw new Error("Failed to create channel");
    }
};

/**
 * Retrieves all channels for a given server, including their messages and participants.
 * @async
 * @function getAllChannels
 * @param {number} serverId - The server ID.
 * @returns {Promise<Array>} An array of channel objects.
 * @throws {Error} Throws if retrieval fails.
 */
const getAllChannels = async (serverId) => {
    try {
        const channels = await Channel.findAll({
            where: { server_id: serverId },
            include: [
                {
                    model: Message,
                    as: "Messages",
                    attributes: ["id", "content", "timestamp"],
                },
                {
                    model: User,
                    as: "Participants",
                    attributes: ["id", "username", "email"],
                    through: { attributes: [] },
                }
            ],
        });
        return channels;
    } catch (error) {
        console.error("Error retrieving channels:", error);
        throw new Error("Failed to retrieve channels");
    }
};

/**
 * Retrieves a specific channel by its ID.
 * @async
 * @function getChannelById
 * @param {number} id - The channel ID.
 * @returns {Promise<Object>} The channel object.
 * @throws {Error} Throws if channel not found or retrieval fails.
 */
const getChannelById = async (id) => {
    try {
        const channel = await Channel.findByPk(id, {
            include: [
                {
                    model: Message,
                    as: "Messages",
                    attributes: ["id", "content", "timestamp"],
                },
                {
                    model: User,
                    as: "Participants",
                    attributes: ["id", "username", "email"],
                    through: { attributes: [] },
                }
            ],
        });
        if (!channel) throw new Error(`Channel with ID ${id} not found`);
        return channel;
    } catch (error) {
        console.error("Error retrieving channel by ID:", error);
        throw new Error("Failed to retrieve channel");
    }
};

/**
 * Updates a channel with the provided updates.
 * @async
 * @function updateChannel
 * @param {number} id - The channel ID.
 * @param {Object} updates - The fields to update (e.g., { name: "New Channel Name" }).
 * @returns {Promise<Object>} The updated channel object.
 * @throws {Error} Throws if channel not found or update fails.
 */
const updateChannel = async (id, updates) => {
    try {
        const [updated] = await Channel.update(updates, {
            where: { id },
            returning: true,
        });
        if (!updated) throw new Error(`Channel with ID ${id} not found`);
        return await getChannelById(id);
    } catch (error) {
        console.error("Error updating channel:", error);
        throw new Error("Failed to update channel");
    }
};

/**
 * Deletes a channel by its ID.
 * @async
 * @function deleteChannel
 * @param {number} id - The channel ID.
 * @returns {Promise<Object>} A success message.
 * @throws {Error} Throws if channel not found or deletion fails.
 */
const deleteChannel = async (id) => {
    try {
        const channel = await Channel.findByPk(id);
        if (!channel) throw new Error(`Channel with ID ${id} not found`);
        await channel.destroy();
        return { message: "Channel deleted successfully" };
    } catch (error) {
        console.error("Error deleting channel:", error);
        throw new Error("Failed to delete channel");
    }
};

/**
 * Adds a user to a channel as a participant.
 * @async
 * @function addUserToChannel
 * @param {number} channelId - The channel ID.
 * @param {number} userId - The user ID.
 * @returns {Promise<Object>} The updated channel object with new participant.
 * @throws {Error} Throws if channel or user not found or operation fails.
 */
const addUserToChannel = async (channelId, userId) => {
    try {
        const channel = await Channel.findByPk(channelId);
        const user = await User.findByPk(userId);

        if (!channel || !user) throw new Error("Channel or user not found");

        await channel.addParticipant(user);
        return await getChannelById(channelId);
    } catch (error) {
        console.error("Error adding user to channel:", error);
        throw new Error("Failed to add user to channel");
    }
};

/**
 * Removes a user from a channel.
 * @async
 * @function removeUserFromChannel
 * @param {number} channelId - The channel ID.
 * @param {number} userId - The user ID.
 * @returns {Promise<Object>} The updated channel object without the removed participant.
 * @throws {Error} Throws if channel or user not found or operation fails.
 */
const removeUserFromChannel = async (channelId, userId) => {
    try {
        const channel = await Channel.findByPk(channelId);
        const user = await User.findByPk(userId);

        if (!channel || !user) throw new Error("Channel or user not found");

        await channel.removeParticipant(user);
        return await getChannelById(channelId);
    } catch (error) {
        console.error("Error removing user from channel:", error);
        throw new Error("Failed to remove user from channel");
    }
};

module.exports = {
    createChannel,
    getAllChannels,
    getChannelById,
    updateChannel,
    deleteChannel,
    addUserToChannel,
    removeUserFromChannel,
};
