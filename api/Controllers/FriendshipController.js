const friendshipService = require("../Services/FriendshipService");

const addFriend = async (req, res) => {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
        return res.status(400).json({ error: "User ID and Friend ID are required" });
    }

    try {
        // Step 1: Check if there is already a friendship or pending request
        const existingFriendship = await friendshipService.areFriends(userId, friendId);

        if (existingFriendship === 'accepted') {
            return res.status(400).json({ error: "You are already friends with this user." });
        } else if (existingFriendship === 'pending') {
            return res.status(400).json({ error: "A friend request is already pending with this user." });
        }

        // Step 2: If no existing friendship, proceed to send a friend request
        const response = await friendshipService.addFriend(userId, friendId);
        return res.status(201).json(response);
    } catch (error) {
        console.error("Error in addFriend controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};


// Accept a friend request
const acceptFriendRequest = async (req, res) => {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
        return res.status(400).json({ error: "User ID and Friend ID are required" });
    }

    try {
        const response = await friendshipService.acceptFriendRequest(userId, friendId);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in acceptFriendRequest controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Reject a friend request
const rejectFriendRequest = async (req, res) => {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
        return res.status(400).json({ error: "User ID and Friend ID are required" });
    }

    try {
        const response = await friendshipService.rejectFriendRequest(userId, friendId);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in rejectFriendRequest controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Remove a friend
const removeFriend = async (req, res) => {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
        return res.status(400).json({ error: "User ID and Friend ID are required" });
    }

    try {
        const response = await friendshipService.removeFriend(userId, friendId);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in removeFriend controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Block a user
const blockUser = async (req, res) => {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
        return res.status(400).json({ error: "User ID and Friend ID are required" });
    }

    try {
        const response = await friendshipService.blockUser(userId, friendId);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in blockUser controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Unblock a user
const unblockUser = async (req, res) => {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
        return res.status(400).json({ error: "User ID and Friend ID are required" });
    }

    try {
        const response = await friendshipService.unblockUser(userId, friendId);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in unblockUser controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Check if two users are friends
const areFriends = async (req, res) => {
    const { userId, friendId } = req.params;

    if (!userId || !friendId) {
        return res.status(400).json({ error: "User ID and Friend ID are required" });
    }

    try {
        const isFriend = await friendshipService.areFriends(userId, friendId);
        return res.status(200).json({ areFriends: isFriend });
    } catch (error) {
        console.error("Error in areFriends controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Get all friends of a user with their statuses
const getFriends = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const friends = await friendshipService.getFriends(userId);
        return res.status(200).json(friends);
    } catch (error) {
        console.error("Error in getFriends controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};


module.exports = {
    addFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    areFriends,
    getFriends
};
