/**
 * DirectMessageService.js
 * 
 * This service file provides methods to interact with the backend API for managing direct messages (DMs)
 * and their associated messages. It includes functionality to create or fetch existing DMs between users,
 * retrieve messages for a specific DM, and delete individual messages.
 * 
 * Key Functionalities:
 * - Create or retrieve an existing DM between two users.
 * - Fetch all DMs associated with a specific user.
 * - Retrieve all messages within a particular DM.
 * - Delete a specific message by its ID.
 * 
 * Usage:
 * Import this service into your components and call the desired function with the required parameters.
 */

import http from "../http-common";
import { getTokenBearer } from "../Utils/Utils";
const createOrGetDirectMessage = (user1Id, user2Id) => {
    return http.post("/direct-messages", { user1_id: user1Id, user2_id: user2Id }, {
        headers: { Authorization: getTokenBearer() },
    });
};

const getDirectMessagesByUser = (userId) => {
    return http.get(`/direct-messages/user/${userId}`, {
        headers: { Authorization: getTokenBearer() },
    });
};

const getMessagesByDM = (dmId) => {
    return http.get(`/messages/dm/${dmId}`);
};

const deleteMessage = (messageId) => {
    return http.delete(`/messages/${messageId}`, {
        headers: { Authorization: getTokenBearer() },
    });
};

export default {
    createOrGetDirectMessage,
    getDirectMessagesByUser,
    getMessagesByDM,
    deleteMessage,
};
