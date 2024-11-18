/**
 * ChannelService.js
 * 
 * This service file provides methods to interact with the backend API for managing server channels.
 * It includes functionalities such as fetching, creating, updating, and deleting channels, 
 * as well as adding or removing users and retrieving messages associated with a channel.
 * 
 * Key Functionalities:
 * - Fetch channels by server ID or individual channel details by channel ID.
 * - Create, update, or delete a channel.
 * - Add or remove users from channels.
 * - Retrieve and delete messages within a channel.
 * 
 * Usage:
 * Import this service into components and call the desired method with appropriate parameters.
 */

import http from "../http-common";

const getChannelsByServer = async (serverId) => {
    try {
        const response = await http.get(`/channels/${serverId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in getChannelsByServer:', error);
        throw error;
    }
};
const getChannelById = async (channelId) => {
    try {
        const response = await http.get(`/channels/channel/${channelId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching channel:", error);
        throw new Error("Failed to fetch channel");
    }
};

const createChannel = async (channelData) => {
    try {
        const response = await http.post(`/channels/`, channelData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (response.data && response.data.id) {
            return response.data;
        }

        return response.data.channel || response.data;
    } catch (error) {
        console.error("Error in createChannel:", error);
        throw error;
    }
};


const updateChannel = async (channelId, updates) => {
    try {
        const response = await http.put(`/channels/${channelId}`, updates, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data.channel;
    } catch (error) {
        console.error("Error updating channel:", error);
        throw new Error("Failed to update channel");
    }
};

const deleteChannel = async (channelId) => {
    try {
        const response = await http.delete(`/channels/${channelId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data.message;
    } catch (error) {
        console.error("Error deleting channel:", error);
        throw new Error("Failed to delete channel");
    }
};

const addUserToChannel = async (channelId, userId) => {
    try {
        const response = await http.post(
            `/channels/addUser`,
            { channelId, userId },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        return response.data.channel;
    } catch (error) {
        console.error("Error adding user to channel:", error);
        throw new Error("Failed to add user to channel");
    }
};

const removeUserFromChannel = async (channelId, userId) => {
    try {
        const response = await http.post(
            `/channels/removeUser`,
            { channelId, userId },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        return response.data.message;
    } catch (error) {
        console.error("Error removing user from channel:", error);
        throw new Error("Failed to remove user from channel");
    }
};
const getMessagesByChannel = async (channelId) => {
    try {
        const response = await http.get(`/messages/channel/${channelId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching messages by channel:", error);
        throw new Error("Failed to fetch messages");
    }
};
const deleteMessage = async (messageId) => {
    try {
        const response = await http.delete(`/messages/${messageId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting message:", error);
        throw new Error("Failed to delete message");
    }
};


export default {
    getChannelsByServer,
    getChannelById,
    createChannel,
    updateChannel,
    deleteChannel,
    addUserToChannel,
    removeUserFromChannel,
    getMessagesByChannel,
    deleteMessage
};
