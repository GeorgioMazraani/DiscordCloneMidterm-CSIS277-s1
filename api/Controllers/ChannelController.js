const ChannelService = require("../Services/ChannelServices");

const createChannelController = async (req, res) => {
    try {
        const { name, type, serverId, isPrivate } = req.body;
        const channel = await ChannelService.createChannel(name, type, serverId, isPrivate);
        res.status(201).json(channel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllChannelsController = async (req, res) => {
    try {
        const { serverId } = req.params;
        const channels = await ChannelService.getAllChannels(serverId);
        res.status(200).json(channels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getChannelByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const channel = await ChannelService.getChannelById(id);
        res.status(200).json(channel);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const updateChannelController = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedChannel = await ChannelService.updateChannel(id, updates);
        res.status(200).json(updatedChannel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteChannelController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ChannelService.deleteChannel(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addUserToChannelController = async (req, res) => {
    try {
        const { channelId, userId } = req.body;
        const updatedChannel = await ChannelService.addUserToChannel(channelId, userId);
        res.status(200).json(updatedChannel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeUserFromChannelController = async (req, res) => {
    try {
        const { channelId, userId } = req.body;
        const updatedChannel = await ChannelService.removeUserFromChannel(channelId, userId);
        res.status(200).json(updatedChannel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createChannelController,
    getAllChannelsController,
    getChannelByIdController,
    updateChannelController,
    deleteChannelController,
    addUserToChannelController,
    removeUserFromChannelController,
};
