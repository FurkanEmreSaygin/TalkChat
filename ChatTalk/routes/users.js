var express = require('express');
var router = express.Router();
const authController = require("../controllers/authController");
const { validateRegister, validateLogin } = require('../middlewares/authValidation');

router.post('/register',validateRegister, authController.register);
router.post("/login",validateLogin, authController.login);
router.get("/getUsers", authController.getUsers);

module.exports = router;
