const messageService = require("../services/messageService.js")

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
exports.markAsRead = async (req, res) => {
  try {
    const { senderId } = req.body; // Mesajları kim attı? (Karşı taraf)
    const recipientId = req.user.userId; // Okuyan kim? (Ben)

    await messageService.markAsRead(senderId, recipientId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
