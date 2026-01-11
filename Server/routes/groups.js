const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const groupController = require("../controllers/groupController");
const validate = require("../middlewares/validate");
const { createGroupSchema } = require("../schemas/groupSchema");

router.use(authMiddleware);

router.get("/my-groups", groupController.getMyGroups);
router.post("/create", validate(createGroupSchema), groupController.createGroup);

module.exports = router;
