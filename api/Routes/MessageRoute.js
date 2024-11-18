const express = require("express");
const messageController = require("../Controllers/MessageController");

const router = express.Router();

// Route to create a new message (either in a channel or a DM)
router.post("/", messageController.createMessage);

// Route to get messages by channel
router.get("/channel/:channelId", messageController.getMessagesByChannel);

// Route to get messages by DM (direct message session)
router.get("/dm/:dmId", messageController.getMessagesByDM);

// Route to get messages by user
router.get("/user/:userId", messageController.getMessagesByUser);

// Route to delete a message by ID
router.delete("/:messageId", messageController.deleteMessage);

// Route to update a message by ID
router.put("/:messageId", messageController.updateMessage);

module.exports = router;
