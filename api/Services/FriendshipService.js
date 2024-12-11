// services/friendshipService.js
const Friendship = require("../Models/Friendship");
const User = require("../Models/User");
const dm = require("../Services/DirectMessageService");
const Sequelize = require("sequelize");

/**
 * Sends a friend request from one user to another.
 * @async
 * @function addFriend
 * @param {number} userId - The ID of the user sending the request.
 * @param {number} friendId - The ID of the user receiving the request.
 * @returns {Promise<Object>} The created friendship record.
 * @throws {Error} Throws if request already sent or cannot be created.
 */
const addFriend = async (userId, friendId) => {
    try {
        const existingFriendship = await Friendship.findOne({
            where: {
                user_id: userId,
                friend_id: friendId,
                status: { [Sequelize.Op.in]: ["pending", "accepted"] }
            }
        });

        if (existingFriendship) {
            throw new Error("Friend request already sent or users are already friends");
        }
        const friendship = await Friendship.create({
            user_id: userId,
            friend_id: friendId,
            status: "pending"
        });

        return friendship;
    } catch (error) {
        console.error("Error sending friend request:", error);
        throw new Error("Failed to send friend request");
    }
};

/**
 * Accepts a pending friend request.
 * @async
 * @function acceptFriendRequest
 * @param {number} userId - The ID of the user accepting the request.
 * @param {number} friendId - The ID of the user who sent the request.
 * @returns {Promise<Object>} The updated friendship record.
 * @throws {Error} Throws if no pending request is found or update fails.
 */
const acceptFriendRequest = async (userId, friendId) => {
    try {
        const friendship = await Friendship.findOne({
            where: { user_id: friendId, friend_id: userId, status: "pending" }
        });

        if (!friendship) {
            throw new Error("No pending friend request found");
        }

        friendship.status = "accepted";
        await friendship.save();

        await Friendship.create({
            user_id: userId,
            friend_id: friendId,
            status: "accepted"
        });

        return friendship;
    } catch (error) {
        console.error("Error accepting friend request:", error);
        throw new Error("Failed to accept friend request");
    }
};

/**
 * Rejects a pending friend request.
 * @async
 * @function rejectFriendRequest
 * @param {number} userId - The ID of the user rejecting the request.
 * @param {number} friendId - The ID of the user who sent the request.
 * @returns {Promise<Object>} A success message.
 * @throws {Error} Throws if no pending request is found or deletion fails.
 */
const rejectFriendRequest = async (userId, friendId) => {
    try {
        const friendship = await Friendship.findOne({
            where: { user_id: friendId, friend_id: userId, status: "pending" }
        });

        if (!friendship) {
            throw new Error("No pending friend request found");
        }

        await friendship.destroy();

        return { message: "Friend request rejected and friendship deleted" };
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        throw new Error("Failed to reject friend request");
    }
};

/**
 * Removes a friend relationship between two users.
 * @async
 * @function removeFriend
 * @param {number} userId - The ID of one of the users.
 * @param {number} friendId - The ID of the other user.
 * @returns {Promise<Object>} A success message.
 * @throws {Error} Throws if friendship does not exist or removal fails.
 */
const removeFriend = async (userId, friendId) => {
    try {
        const deletedCount = await Friendship.destroy({
            where: { user_id: userId, friend_id: friendId }
        });

        await Friendship.destroy({
            where: { user_id: friendId, friend_id: userId }
        });

        if (!deletedCount) {
            throw new Error("Friendship does not exist");
        }
        await dm.deleteDirectMessagesBetweenUsers(userId, friendId);
        return { message: "Friend removed successfully" };
    } catch (error) {
        console.error("Error removing friend:", error);
        throw new Error("Failed to remove friend");
    }
};

/**
 * Blocks a user and removes any friendship or pending request.
 * @async
 * @function blockUser
 * @param {number} userId - The ID of the user blocking.
 * @param {number} friendId - The ID of the user being blocked.
 * @returns {Promise<Object>} A success message.
 * @throws {Error} Throws if blocking fails.
 */
const blockUser = async (userId, friendId) => {
    try {
        const [friendship] = await Friendship.findOrCreate({
            where: { user_id: userId, friend_id: friendId },
            defaults: { status: "rejected", blocked: true }
        });

        if (!friendship.blocked) {
            friendship.status = "rejected";
            friendship.blocked = true;
            await friendship.save();
        }

        await Friendship.destroy({
            where: { user_id: friendId, friend_id: userId }
        });
        await dm.deleteDirectMessagesBetweenUsers(userId, friendId);

        return { message: "User blocked successfully" };
    } catch (error) {
        console.error("Error blocking user:", error);
        throw new Error("Failed to block user");
    }
};

/**
 * Unblocks a user and resets the friendship status.
 * @async
 * @function unblockUser
 * @param {number} userId - The ID of the user unblocking.
 * @param {number} friendId - The ID of the user being unblocked.
 * @returns {Promise<Object>} A success message.
 * @throws {Error} Throws if unblocking fails or no friendship found.
 */
const unblockUser = async (userId, friendId) => {
    try {
        const friendships = await Friendship.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { user_id: userId, friend_id: friendId },
                    { user_id: friendId, friend_id: userId }
                ]
            }
        });

        if (friendships.length === 0) {
            throw new Error("No existing friendship found between these users");
        }

        for (const friendship of friendships) {
            if (friendship.user_id === friendId && friendship.friend_id === userId) {
                await friendship.destroy();
            } else {
                friendship.blocked = false;
                friendship.status = "pending";
                await friendship.save();
            }
        }

        return { message: "User unblocked successfully and friendship reset to initial state" };
    } catch (error) {
        console.error("Error unblocking user:", error);
        throw new Error("Failed to unblock user");
    }
};

/**
 * Checks if two users are friends (status accepted).
 * @async
 * @function areFriends
 * @param {number} userId - The first user's ID.
 * @param {number} friendId - The second user's ID.
 * @returns {Promise<boolean>} True if they are friends, otherwise false.
 * @throws {Error} Throws if lookup fails.
 */
const areFriends = async (userId, friendId) => {
    try {
        const friendship = await Friendship.findOne({
            where: { user_id: userId, friend_id: friendId, status: "accepted" }
        });

        return friendship !== null;
    } catch (error) {
        console.error("Error checking friendship status:", error);
        throw new Error("Failed to check friendship status");
    }
};

/**
 * Retrieves lists of accepted, pending, and blocked friends for a user.
 * @async
 * @function getFriends
 * @param {number} userId - The user's ID.
 * @returns {Promise<Object>} An object with arrays of accepted, pending, and blocked friends.
 * @throws {Error} Throws if retrieval fails.
 */
const getFriends = async (userId) => {
    try {
        const acceptedFriends = await User.findByPk(userId, {
            include: [{
                model: User,
                as: "Friends",
                through: {
                    model: Friendship,
                    where: { status: "accepted", blocked: false }
                },
                attributes: ["id", "username", "email", "status"]
            }],
            attributes: []
        });

        const pendingFriends = await User.findByPk(userId, {
            include: [{
                model: User,
                as: "Requesters",
                through: {
                    model: Friendship,
                    where: { status: "pending", blocked: false }
                },
                attributes: ["id", "username", "email", "status"]
            }],
            attributes: []
        });

        const blockedFriends = await User.findByPk(userId, {
            include: [{
                model: User,
                as: "Friends",
                through: {
                    model: Friendship,
                    where: { blocked: true, user_id: userId }
                },
                attributes: ["id", "username", "email", "status"]
            }],
            attributes: []
        });

        const accepted = acceptedFriends.Friends.map(friend => ({
            id: friend.id,
            username: friend.username,
            email: friend.email,
            status: friend.status
        }));

        const pending = pendingFriends.Requesters.map(requester => ({
            id: requester.id,
            username: requester.username,
            email: requester.email,
            status: requester.status
        }));

        const blocked = blockedFriends.Friends.map(friend => ({
            id: friend.id,
            username: friend.username,
            email: friend.email,
            status: friend.status
        }));

        return {
            accepted,
            pending,
            blocked
        };
    } catch (error) {
        console.error("Error retrieving friends:", error);
        throw new Error("Failed to retrieve friends");
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
