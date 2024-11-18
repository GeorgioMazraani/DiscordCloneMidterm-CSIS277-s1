/**
 * ServerService.js
 * 
 * This service file provides methods to interact with the backend API for managing server-related operations.
 * It abstracts HTTP requests for CRUD operations on servers, including fetching, creating, updating, 
 * and deleting servers. Additionally, it includes methods for managing server icons and adding users to servers.
 * 
 * Key Functionalities:
 * - Fetch server details by ID or get all servers.
 * - Create, update, and delete servers.
 * - Update server icons and details.
 * - Add users to servers using invitations.
 * 
 * Usage:
 * Import the service and call the required function with the necessary parameters.
 */

import http from "../http-common";

const getServerById = async (serverId) => {
    try {
        const response = await http.get(`/servers/${serverId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching server by ID ${serverId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to fetch server");
    }
};

const getAllServers = async () => {
    try {
        const response = await http.get("/servers/");
        return response.data;
    } catch (error) {
        console.error("Error fetching all servers:", error);
        throw new Error(error.response?.data?.message || "Failed to fetch servers");
    }
};

const createServer = async (name, ownerId, icon) => {
    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('ownerId', ownerId);
        if (icon) {
            formData.append('icon', icon);
        }

        const response = await http.post(`/servers/`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating server:', error);
        throw new Error(error.response?.data?.message || 'Failed to create server');
    }
};


const updateServerDetails = async (serverId, name) => {
    try {
        const response = await http.put(`/servers/${serverId}/details`, { name });
        return response.data;
    } catch (error) {
        console.error(`Error updating server details with ID ${serverId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to update server details");
    }
};

const updateServerIcon = async (serverId, icon) => {
    try {
        const formData = new FormData();
        formData.append("icon", icon);

        const response = await http.put(`/servers/${serverId}/icon`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating server icon with ID ${serverId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to update server icon");
    }
};

const deleteServer = async (serverId) => {
    try {
        const response = await http.delete(`/servers/${serverId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting server with ID ${serverId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to delete server");
    }
};

const addUserToServer = async (serverId, inviterId, inviteeId) => {
    try {
        const response = await http.post("/servers/addUser", {
            serverId,
            inviterId,
            inviteeId,
        });
        return response.data;
    } catch (error) {
        console.error("Error adding user to server:", error);
        throw new Error(error.response?.data?.message || "Failed to add user to server");
    }
};

const ServerService = {
    getServerById,
    getAllServers,
    createServer,
    updateServerDetails,
    updateServerIcon,
    deleteServer,
    addUserToServer,
};

export default ServerService;

