// services/ChannelService.js
const Channel = require("../Models/Channel");
const User = require("../Models/User");
const Message = require("../Models/Message");

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
