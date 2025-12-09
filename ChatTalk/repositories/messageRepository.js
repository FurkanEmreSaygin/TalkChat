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

}

module.exports = new MessageRepository();
