const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const authMiddleware = require("../middlewares/auth");
router.use(authMiddleware);

// Rotalar
router.get("/search", friendController.searchUsers); 
router.post("/request", friendController.sendFriendRequest); 
router.post("/accept", friendController.acceptFriendRequest); 
router.get("/requests", friendController.getFriendRequests);
router.get("/list", friendController.getFriends); 

module.exports = router;
