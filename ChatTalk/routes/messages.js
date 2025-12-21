var express = require("express");
var router = express.Router();
const messageController = require("../controllers/messageController")
const authMiddleware = require("../middlewares/auth")

router.get("/:recipientId",authMiddleware , messageController.getMessagesBetweenUsers);
router.post("/mark-read", authMiddleware, messageController.markAsRead);

module.exports = router;
