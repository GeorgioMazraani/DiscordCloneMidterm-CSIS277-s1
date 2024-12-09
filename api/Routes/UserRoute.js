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
