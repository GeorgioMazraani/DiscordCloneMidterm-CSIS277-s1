const express = require("express");
const directMessageController = require("../Controllers/DirectMessageController");

const router = express.Router();

// Route to create or retrieve a DM session between two users
router.post("/", directMessageController.createOrGetDirectMessage);

// Route to get all DM sessions for a specific user
router.get("/user/:userId", directMessageController.getDirectMessagesByUser);

module.exports = router;
