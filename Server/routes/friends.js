const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const authMiddleware = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { friendRequestSchema, acceptFriendSchema, searchUserSchema } = require("../schemas/friendSchema");
const { searchLimiter } = require("../middlewares/rateLimiter");

router.use(authMiddleware);

router.get("/search", searchLimiter, validate(searchUserSchema), friendController.searchUsers);
router.post("/request", validate(friendRequestSchema), friendController.sendFriendRequest);
router.post("/accept", validate(acceptFriendSchema), friendController.acceptFriendRequest);
router.get("/requests", friendController.getFriendRequests);
router.get("/list", friendController.getFriends);
router.post("/remove-friend", friendController.removeFriend);

module.exports = router;
