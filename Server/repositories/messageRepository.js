const Message = require("../models/Message");
const Group = require("../models/Groups"); // Grup modelini import et

class MessageRepository {
  async createMessage(senderId, recipientId, content, senderContent, type = "text") {
    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      content: content,
      senderContent: senderContent,
      type: type,
    });

    return await newMessage.save();
  }

  async getMessagesBetweenUsers(currentUserId, targetId) {
    const isGroup = await Group.exists({ _id: targetId });

    if (isGroup) {
      return await Message.find({ recipient: targetId }).populate("sender", "userName profilePic avatar").sort({ createdAt: 1 });
    } else {
      return await Message.find({
        $or: [
          { sender: currentUserId, recipient: targetId },
          { sender: targetId, recipient: currentUserId },
        ],
      }).sort({ createdAt: 1 });
    }
  }

  async markAsRead(senderId, recipientId) {
    return await Message.updateMany({ sender: senderId, recipient: recipientId, isRead: false }, { $set: { isRead: true } });
  }

  async countUnreadMessages(senderId, recipientId) {
    return await Message.countDocuments({ sender: senderId, recipient: recipientId, isRead: false });
  }
}

module.exports = new MessageRepository();
