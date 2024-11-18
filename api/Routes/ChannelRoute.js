// routes/channelRoute.js
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
