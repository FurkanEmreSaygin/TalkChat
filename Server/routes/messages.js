var express = require("express");
var router = express.Router();
const messageController = require("../controllers/messageController")
const authMiddleware = require("../middlewares/auth")
const validate = require("../middlewares/validate");
const { sendMessageSchema } = require("../schemas/messageSchema");

router.post("/send", authMiddleware, validate(sendMessageSchema), messageController.sendMessage);
router.get("/:recipientId",authMiddleware , messageController.getMessagesBetweenUsers);
router.post("/mark-read", authMiddleware, messageController.markAsRead);

module.exports = router;
