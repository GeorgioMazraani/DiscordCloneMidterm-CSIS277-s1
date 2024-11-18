// services/friendshipService.js
const Friendship = require("../Models/Friendship");
const User = require("../Models/User");
const dm = require("../Services/DirectMessageService");

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


const Sequelize = require("sequelize");

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