const messageRepository = require("../../repositories/messageRepository");

module.exports = (io, socket, onlineUsers) => {
  const sendMessage = async (data) => {
    try {
      const { recipientId, content, senderContent, type } = data;

      if (!recipientId || !content || !senderContent) {
        return socket.emit("error", { message: "Eksik veri gönderildi (Recipient/Content)." });
      }

      const savedMessage = await messageRepository.createMessage(socket.user._id, recipientId, content, senderContent, type);

      console.log(`📨 Message Saved: ${socket.user.userName} -> ${recipientId}`);

      socket.emit("messageSent", { success: true, message: savedMessage });

      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newMessage", savedMessage);
        console.log(`🚀 Delivered to socket: ${recipientSocketId}`);
      } else {
        console.log(`📭 User ${recipientId} is offline.`);
      }
    } catch (error) {
      console.error("Socket SendMessage Error:", error);
      socket.emit("error", { message: "Mesaj gönderilirken sunucu hatası oluştu." });
    }
  };

  const markAsRead = async ({ senderId }) => {
    const senderSocketId = onlineUsers.get(senderId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        readerId: socket.user._id.toString(),
      });
    }
  };

  socket.on("sendMessage", sendMessage);
  socket.on("markMessagesAsRead", markAsRead);
};
