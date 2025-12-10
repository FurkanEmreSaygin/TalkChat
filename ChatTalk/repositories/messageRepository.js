const Message = require("../models/Message");

class MessageRepository {
  async createMessage(senderId, recipientId, content) {
    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      content: content,
    });

    return await newMessage.save();
  }

  async getMessagesBetweenUsers(userId1, userId2) {
    return await Message.find({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 },
      ],
    }).sort({ createdAt: 1 });
  }
}

module.exports = new MessageRepository();
