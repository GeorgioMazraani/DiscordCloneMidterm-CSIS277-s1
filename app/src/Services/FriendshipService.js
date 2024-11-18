/**
 * FriendshipService.js
 * 
 * This service file provides methods to interact with the backend API for managing friendship-related operations.
 * It abstracts HTTP requests for sending, accepting, rejecting, and removing friend requests, as well as blocking,
 * unblocking users, and checking friendship status.
 * 
 * Key Functionalities:
 * - Send, accept, or reject friend requests.
 * - Remove friends from the friend list.
 * - Block or unblock users.
 * - Check if two users are friends.
 * - Fetch the list of friends for a specific user.
 * 
 * Usage:
 * Import this service into your components and call the desired function with appropriate parameters.
 */

import http from "../http-common";
import { getTokenBearer } from "../Utils/Utils";

const addFriend = (userId, friendId) => {
    return http.post("/friend/add", { userId, friendId }, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const acceptFriendRequest = (userId, friendId) => {
    return http.post("/friend/accept", { userId, friendId }, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const rejectFriendRequest = (userId, friendId) => {
    return http.post("/friend/reject", { userId, friendId }, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const removeFriend = (userId, friendId) => {
    return http.delete("/friend/remove", {
        headers: {
            Authorization: getTokenBearer()
        },
        data: { userId, friendId }
    });
};

const blockUser = (userId, friendId) => {
    return http.post("/friend/block", { userId, friendId }, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const unblockUser = (userId, friendId) => {
    return http.post("/friend/unblock", { userId, friendId }, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const areFriends = (userId, friendId) => {
    return http.get(`/friend/status/${userId}/${friendId}`, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const getFriends = (userId) => {
    return http.get(`/friend/${userId}/friends`, {
        headers: {
            Authorization: getTokenBearer()
        }
    })
        .then(response => response.data)
        .catch(error => {
            console.error("Error fetching friends:", error);
            throw error;
        });
};

const FriendshipService = {
    addFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    areFriends,
    getFriends
};

export default FriendshipService;
