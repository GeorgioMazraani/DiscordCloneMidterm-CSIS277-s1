/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message management and retrieval
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Create a new message
 *     description: Add a new message to a channel or direct message session.
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - senderId
 *             properties:
 *               content:
 *                 type: string
 *                 description: The message content.
 *               senderId:
 *                 type: string
 *                 description: The ID of the sender.
 *               channelId:
 *                 type: string
 *                 description: The ID of the channel (optional, mutually exclusive with dmId).
 *               dmId:
 *                 type: string
 *                 description: The ID of the direct message session (optional, mutually exclusive with channelId).
 *     responses:
 *       201:
 *         description: Message created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/messages/channel/{channelId}:
 *   get:
 *     summary: Get messages by channel ID
 *     description: Retrieve all messages in a specific channel.
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: The ID of the channel.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: Missing channel ID.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/messages/dm/{dmId}:
 *   get:
 *     summary: Get messages by DM ID
 *     description: Retrieve all messages in a specific direct message session.
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dmId
 *         required: true
 *         description: The ID of the direct message session.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: Missing DM ID.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/messages/user/{userId}:
 *   get:
 *     summary: Get messages by user ID
 *     description: Retrieve all messages sent by a specific user.
 *     tags: [Messages]
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
 *         description: Messages retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: Missing user ID.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     summary: Delete a message by ID
 *     description: Remove a message by its ID.
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         description: The ID of the message to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully.
 *       400:
 *         description: Missing message ID.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/messages/{messageId}:
 *   put:
 *     summary: Update a message by ID
 *     description: Modify the content of a message by its ID.
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         description: The ID of the message to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newContent
 *             properties:
 *               newContent:
 *                 type: string
 *                 description: The new content of the message.
 *     responses:
 *       200:
 *         description: Message updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Missing message ID or new content.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - content
 *         - sender_id
 *         - timestamp
 *       properties:
 *         id:
 *           type: string
 *           description: The unique ID of the message.
 *         content:
 *           type: string
 *           description: The content of the message.
 *         sender_id:
 *           type: string
 *           description: The ID of the user who sent the message.
 *         channel_id:
 *           type: string
 *           description: The ID of the channel the message belongs to (optional).
 *         dm_id:
 *           type: string
 *           description: The ID of the direct message session the message belongs to (optional).
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the message was created.
 */


const express = require("express");
const messageController = require("../Controllers/MessageController");
const authenticateToken = require("../Middleware/AuthToken"); // Import the authentication middleware

const router = express.Router();

// Route to create a new message (either in a channel or a DM)
router.post("/", authenticateToken, messageController.createMessage);

// Route to get messages by channel
router.get("/channel/:channelId", authenticateToken, messageController.getMessagesByChannel);

// Route to get messages by DM (direct message session)
router.get("/dm/:dmId", authenticateToken, messageController.getMessagesByDM);

// Route to get messages by user
router.get("/user/:userId", authenticateToken, messageController.getMessagesByUser);

// Route to delete a message by ID
router.delete("/:messageId", authenticateToken, messageController.deleteMessage);

// Route to update a message by ID
router.put("/:messageId", authenticateToken, messageController.updateMessage);

module.exports = router;
