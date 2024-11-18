const express = require("express");
const router = express.Router();
const friendshipController = require("../Controllers/FriendshipController");

router.post("/add", friendshipController.addFriend); //tested
router.post("/accept", friendshipController.acceptFriendRequest); //tested
router.post("/reject", friendshipController.rejectFriendRequest); //tested
router.delete("/remove", friendshipController.removeFriend); //tested
router.post("/block", friendshipController.blockUser); //tested
router.post("/unblock", friendshipController.unblockUser); //tested
router.get("/status/:userId/:friendId", friendshipController.areFriends); //tested
router.get("/:userId/friends", friendshipController.getFriends); //tested

module.exports = router;
