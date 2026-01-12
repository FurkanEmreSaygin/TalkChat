var express = require('express');
var router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../schemas/authSchema");
const { authLimiter } = require("../middlewares/rateLimiter");

router.post("/register", validate(registerSchema), authController.register);
router.post("/login",authLimiter, validate(loginSchema), authController.login);
router.get("/getUsers", authController.getUsers);
router.put("/update",authMiddleware , authController.updateProfile);

module.exports = router;
