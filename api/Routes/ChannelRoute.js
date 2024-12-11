/**
 * @swagger
 * tags:
 *   name: Channels
 *   description: Manage channels within servers
 */

/**
 * @swagger
 * /api/channels/{serverId}:
 *   get:
 *     summary: Retrieve all channels for a server
 *     description: Fetches all channels belonging to a specific server.
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         description: The ID of the server.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of channels for the server.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Channel'
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/channels/channel/{id}:
 *   get:
 *     summary: Retrieve a channel by ID
 *     description: Fetch details of a specific channel using its ID.
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the channel to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Channel retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Channel'
 *       404:
 *         description: Channel not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/channels:
 *   post:
 *     summary: Create a new channel
 *     description: Adds a new channel to a server.
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the channel.
 *               type:
 *                 type: string
 *                 description: The type of the channel (e.g., text, voice).
 *               serverId:
 *                 type: string
 *                 description: The ID of the server the channel belongs to.
 *               isPrivate:
 *                 type: boolean
 *                 description: Whether the channel is private.
 *     responses:
 *       201:
 *         description: Channel created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Channel'
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/channels/{id}:
 *   put:
 *     summary: Update a channel
 *     description: Updates the details of a specific channel.
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the channel to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the channel.
 *               isPrivate:
 *                 type: boolean
 *                 description: Whether the channel is private.
 *     responses:
 *       200:
 *         description: Channel updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Channel'
 *       404:
 *         description: Channel not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/channels/{id}:
 *   delete:
 *     summary: Delete a channel
 *     description: Deletes a specific channel by ID.
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the channel to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Channel deleted successfully.
 *       404:
 *         description: Channel not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/channels/addUser:
 *   post:
 *     summary: Add a user to a channel
 *     description: Adds a user to a specific channel.
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channelId:
 *                 type: string
 *                 description: The ID of the channel to add the user to.
 *               userId:
 *                 type: string
 *                 description: The ID of the user to add.
 *     responses:
 *       200:
 *         description: User added to channel successfully.
 *       404:
 *         description: Channel or user not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/channels/removeUser:
 *   post:
 *     summary: Remove a user from a channel
 *     description: Removes a user from a specific channel.
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channelId:
 *                 type: string
 *                 description: The ID of the channel to remove the user from.
 *               userId:
 *                 type: string
 *                 description: The ID of the user to remove.
 *     responses:
 *       200:
 *         description: User removed from channel successfully.
 *       404:
 *         description: Channel or user not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Channel:
 *       type: object
 *       required:
 *         - name
 *         - serverId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the channel.
 *         name:
 *           type: string
 *           description: Name of the channel.
 *         type:
 *           type: string
 *           description: Type of the channel (e.g., text, voice).
 *         serverId:
 *           type: string
 *           description: The ID of the server the channel belongs to.
 *         isPrivate:
 *           type: boolean
 *           description: Indicates if the channel is private.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the channel was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the channel was last updated.
 */

const express = require("express");
const router = express.Router();
const authToken = require("../Middleware/AuthToken"); // Middleware to authenticate token

const {
    createChannelController,
    getAllChannelsController,
    getChannelByIdController,
    updateChannelController,
    deleteChannelController,
    addUserToChannelController,
    removeUserFromChannelController
} = require("../Controllers/ChannelController");

// GET Routes
router.get("/:serverId", authToken, getAllChannelsController);        // Get all channels for a server
router.get("/channel/:id", authToken, getChannelByIdController);      // Get channel by ID

// POST Routes
router.post("/", authToken, createChannelController);                 // Create a new channel
router.post("/addUser", authToken, addUserToChannelController);       // Add user to a channel

// PUT Routes
router.put("/:id", authToken, updateChannelController);               // Update a channel

// DELETE Routes
router.delete("/:id", authToken, deleteChannelController);            // Delete a channel
router.post("/removeUser", authToken, removeUserFromChannelController); // Remove user from a channel

module.exports = router;
