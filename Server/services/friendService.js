const friendsRepository = require("../repositories/friendsRepository");
const userRepository = require("../repositories/userRepository");
const messageRepository = require("../repositories/messageRepository");

class FriendService {
  async searchUsers(query, currentUserId) {
    if (!query) throw new Error("Arama metni gerekli");
    return await userRepository.searchUsers(query, currentUserId);
  }
  async deleteFriend(currentUserId, targetFriendId) {
    return await friendsRepository.removeFriendship(currentUserId, targetFriendId);
  }

  async sendFriendRequest(senderId, recipientId) {
    if (senderId === recipientId) throw new Error("Kendine istek atamazsın");

    const sender = await userRepository.findUserById(senderId);
    if (sender.friends.includes(recipientId)) {
      throw new Error("Zaten arkadaşsınız.");
    }

    const existingRequest = await friendsRepository.findExistingRequest(senderId, recipientId);
    if (existingRequest) {
      throw new Error("Zaten bekleyen bir istek var.");
    }

    return await friendsRepository.createRequest(senderId, recipientId);
  }

  async acceptFriendRequest(requestId, currentUserId) {
    const request = await friendsRepository.findRequestById(requestId);

    if (!request) throw new Error("İstek bulunamadı");

    if (request.recipient.toString() !== currentUserId) {
      throw new Error("Bu isteği kabul etme yetkiniz yok.");
    }

    await userRepository.addFriendToUser(request.recipient, request.sender);
    await userRepository.addFriendToUser(request.sender, request.recipient);

    await friendsRepository.deleteRequest(requestId);

    return { message: "Arkadaşlık isteği kabul edildi" };
  }

  async getPendingRequests(userId) {
    return await friendsRepository.getPendingRequests(userId);
  }

  async getFriends(userId) {
    const friends = await userRepository.getUserFriends(userId);
    if (!friends || friends.length === 0) return [];
    const friendsWithCounts = await Promise.all(friends.map(async (friend)=>{
      const friendObj = friend.toObject ? friend.toObject() : friend
      const unreadCount = await messageRepository.countUnreadMessages(friendObj._id, userId);
      return { ...friendObj, unreadCount };
    }))
    return friendsWithCounts;
  }
}

module.exports = new FriendService();