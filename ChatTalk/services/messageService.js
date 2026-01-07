const messageRepository = require("../repositories/messageRepository");

class MessageService {
  async getMessagesBetweenUsers(senderId, recipientId) {
    console.log(`Mesajlar getiriliyor... Gönderen: ${senderId}, Alıcı: ${recipientId}`);

    const oldMessages = await messageRepository.getMessagesBetweenUsers(senderId, recipientId);

    return oldMessages;
  }
  async markAsRead(senderId, recipientId) {
    return await messageRepository.markAsRead(senderId, recipientId);
  }
  async sendMessage(senderId, recipientId, content, senderContent, type) {
    return await messageRepository.createMessage(senderId, recipientId, content, senderContent, type);
  }
}
module.exports = new MessageService();
