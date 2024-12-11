/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve all users
 *     description: Retrieves a list of all users in the system.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, missing or invalid JWT.
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve a specific user by ID
 *     description: Fetch user details for a given user ID.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /api/users/username/{username}:
 *   get:
 *     summary: Retrieve user by username
 *     description: Fetch a user's details using their username.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username to search for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /api/users/getByEmail/{email}:
 *   get:
 *     summary: Retrieve user by email
 *     description: Fetch a user's details using their email.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: The email to search for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Add a new user to the system.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: "securepassword123"
 *               username:
 *                 type: string
 *                 description: The user's username.
 *                 example: "newuser"
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, validation failed.
 */

/**
 * @swagger
 * /api/users/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and retrieve a JWT token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email.
 *               password:
 *                 type: string
 *                 description: User's password.
 *     responses:
 *       200:
 *         description: Successfully authenticated.
 *       401:
 *         description: Invalid credentials.
 */

/**
 * @swagger
 * /api/users/{id}/register-face:
 *   post:
 *     summary: Register face recognition for a user
 *     description: Adds face recognition data for the specified user.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               faceData:
 *                 type: string
 *                 description: Encoded face recognition data.
 *     responses:
 *       200:
 *         description: Face recognition data added.
 *       400:
 *         description: Bad request.
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user details
 *     description: Update the details of a user by their ID.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       400:
 *         description: Validation error.
 */

/**
 * @swagger
 * /api/users/user/{id}/avatar:
 *   put:
 *     summary: Update user avatar
 *     description: Upload or update the user's avatar image.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The avatar file to upload.
 *     responses:
 *       200:
 *         description: Avatar updated successfully.
 *       400:
 *         description: Validation error.
 */

/**
 * @swagger
 * /api/users/{id}/changePassword:
 *   put:
 *     summary: Change user password
 *     description: Allows a user to change their password.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The current password.
 *               newPassword:
 *                 type: string
 *                 description: The new password.
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Removes a user from the system by their ID.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: The user's ID.
 *         username:
 *           type: string
 *           description: The user's username.
 *         email:
 *           type: string
 *           description: The user's email address.
 *         avatar:
 *           type: string
 *           format: binary
 *           description: The user's avatar image.
 */

const express = require("express");
const router = express.Router();
const authenticateToken = require("../Middleware/AuthToken");
const { usersController, upload } = require("../Controllers/UserController");
const authenticateUserController = require("../Controllers/UserAuthController");

const {
    getUserByIdController,
    getAllUsersController,
    createUserController,
    updateUserController,
    deleteUserController,
    getUserByUsernameController,
    getUserByEmailController,
    updateAvatarController,
    changePasswordController
} = usersController;

const {
    insertUserValidation,
    updateUserValidation,
} = require("../Validators/UserValidator");

// GET Routes
router.get("/:id", authenticateToken, getUserByIdController);
router.get("/", authenticateToken, getAllUsersController);
router.get("/username/:username", authenticateToken, getUserByUsernameController);
router.get("/getByEmail/:email", authenticateToken, getUserByEmailController);

// POST Routes
router.post("/", insertUserValidation, createUserController);
router.post("/auth/login", authenticateUserController);
router.post('/:id/register-face', usersController.registerFaceRecognitionController);

// PUT Routes
router.put('/:id', authenticateToken, updateUserValidation, updateUserController);
router.put("/user/:id/avatar", authenticateToken, upload.single('avatar'), updateAvatarController);
router.put("/:id/changePassword", authenticateToken, changePasswordController);

// DELETE Routes
router.delete("/:id", authenticateToken, deleteUserController);

module.exports = router;
