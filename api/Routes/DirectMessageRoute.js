/**
 * @swagger
 * tags:
 *   name: DirectMessages
 *   description: Manage direct messages between users
 */

/**
 * @swagger
 * /api/direct-messages:
 *   post:
 *     summary: Create or retrieve a DM session between two users
 *     description: Creates a new direct message session or retrieves an existing one between two users.
 *     tags: [DirectMessages]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user1_id:
 *                 type: string
 *                 description: The ID of the first user in the DM session.
 *               user2_id:
 *                 type: string
 *                 description: The ID of the second user in the DM session.
 *     responses:
 *       200:
 *         description: Successfully created or retrieved the DM session.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DirectMessage'
 *       400:
 *         description: Missing required fields or invalid input.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/direct-messages/user/{userId}:
 *   get:
 *     summary: Retrieve all DM sessions for a user
 *     description: Fetches all direct message sessions for a specific user by their ID.
 *     tags: [DirectMessages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to retrieve DM sessions for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all direct message sessions for the specified user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DirectMessage'
 *       400:
 *         description: Missing user ID.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DirectMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique ID of the direct message session.
 *         user1_id:
 *           type: string
 *           description: The ID of the first user in the DM session.
 *         user2_id:
 *           type: string
 *           description: The ID of the second user in the DM session.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the DM session was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the DM session was last updated.
 */


const express = require("express");
const directMessageController = require("../Controllers/DirectMessageController");
const authenticateToken = require("../Middleware/AuthToken"); // Import authentication middleware

const router = express.Router();

// Route to create or retrieve a DM session between two users
router.post("/", authenticateToken, directMessageController.createOrGetDirectMessage);

// Route to get all DM sessions for a specific user
router.get("/user/:userId", authenticateToken, directMessageController.getDirectMessagesByUser);

module.exports = router;
