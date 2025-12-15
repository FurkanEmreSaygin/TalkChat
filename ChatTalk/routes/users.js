var express = require('express');
var router = express.Router();
const authController = require("../controllers/authController");
const { validateRegister, validateLogin } = require('../middlewares/authValidation');
const authMiddleware = require("../middlewares/auth");

router.post('/register',validateRegister, authController.register);
router.post("/login",validateLogin, authController.login);
router.get("/getUsers", authController.getUsers);
router.put("/update",authMiddleware , authController.updateProfile);

module.exports = router;
