const messageRepository = require("../repositories/messageRepository");

exports.getMessagesBetweenUsers = async (req, res) => {
  try {

    const { recipientId } = req.params;
    const senderId = req.user.userId;

    console.log(`Mesajlar getiriliyor... Gönderen: ${senderId}, Alıcı: ${recipientId}`);
    
    const oldMessages = await messageRepository.getMessagesBetweenUsers(
      senderId,
      recipientId
    );

    res.status(200).json(oldMessages || []);

  } catch (error) {
    console.error("Get Messages Error :", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
