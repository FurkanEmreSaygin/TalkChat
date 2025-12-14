const messageService = require("../services/messageService.js")
const catchAsync = require("../utils/catchAsync");

exports.getMessagesBetweenUsers = async (req, res) => {
  try {

    const { recipientId } = req.params;
    const oldMessages = await messageService.getMessagesBetweenUsers( req.user.userId, recipientId);

    console.log(oldMessages)
    res.status(200).json(oldMessages || []);

  } catch (error) {
    console.error("Get Messages Error :", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
