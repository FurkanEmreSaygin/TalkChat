var express = require("express");
var router = express.Router();
const messageController = require("../controllers/messageController")
const authMiddleware = require("../middlewares/auth")

router.get("/:recipientId",authMiddleware , messageController.getMessagesBetweenUsers);

module.exports = router;
