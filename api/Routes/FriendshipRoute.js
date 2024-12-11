/**
 * @swagger
 * tags:
 *   name: Friendship
 *   description: Manage user friendships including requests, status, and blocking
 */

/**
 * @swagger
 * /api/friend/add:
 *   post:
 *     summary: Send a friend request
 *     description: Allows a user to send a friend request to another user.
 *     tags: [Friendship]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user sending the friend request.
 *               friendId:
 *                 type: string
 *                 description: ID of the user to whom the friend request is sent.
 *     responses:
 *       201:
 *         description: Friend request sent successfully.
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/friend/accept:
 *   post:
 *     summary: Accept a friend request
 *     description: Allows a user to accept a pending friend request.
 *     tags: [Friendship]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user accepting the request.
 *               friendId:
 *                 type: string
 *                 description: ID of the user whose request is accepted.
 *     responses:
 *       200:
 *         description: Friend request accepted successfully.
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/friend/reject:
 *   post:
 *     summary: Reject a friend request
 *     description: Allows a user to reject a pending friend request.
 *     tags: [Friendship]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user rejecting the request.
 *               friendId:
 *                 type: string
 *                 description: ID of the user whose request is rejected.
 *     responses:
 *       200:
 *         description: Friend request rejected successfully.
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/friend/remove:
 *   delete:
 *     summary: Remove a friend
 *     description: Allows a user to remove an existing friend.
 *     tags: [Friendship]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user removing the friend.
 *               friendId:
 *                 type: string
 *                 description: ID of the user being removed as a friend.
 *     responses:
 *       200:
 *         description: Friend removed successfully.
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/friend/block:
 *   post:
 *     summary: Block a user
 *     description: Allows a user to block another user.
 *     tags: [Friendship]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user blocking another user.
 *               friendId:
 *                 type: string
 *                 description: ID of the user being blocked.
 *     responses:
 *       200:
 *         description: User blocked successfully.
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/friend/unblock:
 *   post:
 *     summary: Unblock a user
 *     description: Allows a user to unblock a previously blocked user.
 *     tags: [Friendship]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user unblocking another user.
 *               friendId:
 *                 type: string
 *                 description: ID of the user being unblocked.
 *     responses:
 *       200:
 *         description: User unblocked successfully.
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/friend/status/{userId}/{friendId}:
 *   get:
 *     summary: Check friendship status
 *     description: Check if two users are friends, or if a friend request is pending.
 *     tags: [Friendship]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user.
 *         schema:
 *           type: string
 *       - in: path
 *         name: friendId
 *         required: true
 *         description: The ID of the other user.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friendship status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 areFriends:
 *                   type: string
 *                   enum: [accepted, pending, blocked, none]
 *                   description: The friendship status.
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/friend/{userId}/friends:
 *   get:
 *     summary: Get friends list
 *     description: Retrieve a list of all friends for a specific user.
 *     tags: [Friendship]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friends list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   friendId:
 *                     type: string
 *                     description: The ID of the friend.
 *                   status:
 *                     type: string
 *                     description: The friendship status.
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */

const express = require("express");
const router = express.Router();
const authenticateToken = require("../Middleware/AuthToken"); // Import authentication middleware
const friendshipController = require("../Controllers/FriendshipController");

// POST Routes
router.post("/add", authenticateToken, friendshipController.addFriend); // Add friend request
router.post("/accept", authenticateToken, friendshipController.acceptFriendRequest); // Accept friend request
router.post("/reject", authenticateToken, friendshipController.rejectFriendRequest); // Reject friend request
router.delete("/remove", authenticateToken, friendshipController.removeFriend); // Remove friend
router.post("/block", authenticateToken, friendshipController.blockUser); // Block user
router.post("/unblock", authenticateToken, friendshipController.unblockUser); // Unblock user

// GET Routes
router.get("/status/:userId/:friendId", authenticateToken, friendshipController.areFriends); // Check friendship status
router.get("/:userId/friends", authenticateToken, friendshipController.getFriends); // Get friends list

module.exports = router;
