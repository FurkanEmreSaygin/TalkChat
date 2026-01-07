const messageService = require("../services/messageService.js");

exports.getMessagesBetweenUsers = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const oldMessages = await messageService.getMessagesBetweenUsers(req.user.userId, recipientId);

    console.log(oldMessages);
    res.status(200).json(oldMessages || []);
  } catch (error) {
    console.error("Get Messages Error :", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    const { senderId } = req.body;
    const recipientId = req.user.userId;

    await messageService.markAsRead(senderId, recipientId);

    const io = req.app.get("io");

    io.to(senderId).emit("messagesRead", { readerId: recipientId });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, senderContent, type } = req.body;
    const senderId = req.user.userId;

    const savedMessage = await messageService.sendMessage(senderId, recipientId, content, senderContent, type);
    const io = req.app.get("io");

    io.to(recipientId).emit("newMessage", savedMessage);

    console.log(`📨 HTTP -> DB -> Socket: Mesaj ${recipientId} kişisine iletildi.`);

    res.status(201).json({
      success: true,
      message: "Mesaj gönderildi",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Send Message Error :", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
