/**
 * @swagger
 * tags:
 *   name: Servers
 *   description: Server management and retrieval
 */

/**
 * @swagger
 * /api/servers/{id}:
 *   get:
 *     summary: Retrieve a specific server by ID
 *     description: Fetch server details for a given server ID.
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The server ID to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Server retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Server'
 *       400:
 *         description: Missing server ID.
 *       404:
 *         description: Server not found.
 */

/**
 * @swagger
 * /api/servers:
 *   get:
 *     summary: Retrieve all servers
 *     description: Fetch a list of all servers in the system.
 *     tags: [Servers]
 *     responses:
 *       200:
 *         description: A list of servers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Server'
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/servers:
 *   post:
 *     summary: Create a new server
 *     description: Add a new server to the system with an optional icon.
 *     tags: [Servers]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the server.
 *               ownerId:
 *                 type: string
 *                 description: ID of the server owner.
 *               icon:
 *                 type: string
 *                 format: binary
 *                 description: Optional server icon file.
 *     responses:
 *       201:
 *         description: Server created successfully.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/servers/{id}/details:
 *   put:
 *     summary: Update server details
 *     description: Update the name or description of a server by its ID.
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The server ID.
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
 *                 description: Updated server name.
 *     responses:
 *       200:
 *         description: Server details updated successfully.
 *       400:
 *         description: Missing server ID or name.
 *       404:
 *         description: Server not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/servers/{id}/icon:
 *   put:
 *     summary: Update server icon
 *     description: Upload or update the server's icon image.
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The server ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               icon:
 *                 type: string
 *                 format: binary
 *                 description: The new icon file to upload.
 *     responses:
 *       200:
 *         description: Server icon updated successfully.
 *       400:
 *         description: Missing server ID or icon.
 *       404:
 *         description: Server not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/servers/{id}:
 *   delete:
 *     summary: Delete a server
 *     description: Removes a server from the system by its ID.
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The server ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Server deleted successfully.
 *       400:
 *         description: Missing server ID.
 *       404:
 *         description: Server not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/servers/addUser:
 *   post:
 *     summary: Add a user to a server
 *     description: Add a user to a server by specifying the server ID and user details.
 *     tags: [Servers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serverId:
 *                 type: string
 *                 description: The ID of the server.
 *               inviterId:
 *                 type: string
 *                 description: The ID of the user sending the invite.
 *               inviteeId:
 *                 type: string
 *                 description: The ID of the user being invited.
 *     responses:
 *       200:
 *         description: User added to server successfully.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Server:
 *       type: object
 *       required:
 *         - name
 *         - ownerId
 *       properties:
 *         id:
 *           type: string
 *           description: The server's unique ID.
 *         name:
 *           type: string
 *           description: The name of the server.
 *         ownerId:
 *           type: string
 *           description: The ID of the server owner.
 *         icon:
 *           type: string
 *           description: URL of the server's icon.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of server creation.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the last update to the server.
 */


const express = require('express');
const router = express.Router();
const authenticateToken = require('../Middleware/AuthToken');
const { serverController, upload } = require('../Controllers/ServerController');

// GET Routes
router.get('/:id', authenticateToken, serverController.getServerByIdController);
router.get('/', authenticateToken, serverController.getAllServersController);

// POST Routes
router.post('/', authenticateToken, upload.single('icon'), serverController.createServerController);
router.post('/addUser', authenticateToken, serverController.addUserToServerController);

// PUT Routes
router.put('/:id/details', authenticateToken, serverController.updateServerDetailsController);
router.put('/:id/icon', authenticateToken, upload.single('icon'), serverController.updateServerIconController);

// DELETE Routes
router.delete('/:id', authenticateToken, serverController.deleteServerController);

module.exports = router;
