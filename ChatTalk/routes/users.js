var express = require('express');
var router = express.Router();
const authController = require("../controllers/authController");

router.post('/register', authController.register);

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
