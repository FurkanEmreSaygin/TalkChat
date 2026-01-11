const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

class FriendsRepository {
  async findExistingRequest(senderId, recipientId) {
    return await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    });
  }
  async createRequest(senderId, recipientId) {
    const newRequest = new FriendRequest({ sender: senderId, recipient: recipientId, status: "pending" });
    return await newRequest.save();
  }
  async removeFriendship(userId, friendId) {
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });

    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    return true;
  }
  async findRequestById(requestId) {
    return await FriendRequest.findById(requestId);
  }

  async deleteRequest(requestId) {
    return await FriendRequest.findByIdAndDelete(requestId);
  }

  async getPendingRequests(recipientId) {
    return await FriendRequest.find({ recipient: recipientId, status: "pending" }).populate("sender", "userName profilePic avatar");
  }
}

module.exports = new FriendsRepository();
