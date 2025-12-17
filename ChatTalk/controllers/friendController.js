const friendService = require("../services/friendService");

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.userId;

    const users = await friendService.searchUsers(query, currentUserId);
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.userId;

    const result = await friendService.sendFriendRequest(senderId, recipientId);

    res.status(201).json({ message: "Arkadaşlık isteği gönderildi", data: result });
  } catch (error) {
    console.error("Send Request Error:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const currentUserId = req.user.userId;

    const result = await friendService.acceptFriendRequest(requestId, currentUserId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Accept Request Error:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    
    const requests = await friendService.getPendingRequests(currentUserId);
    
    res.status(200).json(requests);
  } catch (error) {
    console.error("Get Requests Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const friends = await friendService.getFriends(currentUserId);

    res.status(200).json({ friends });
  } catch (error) {
    console.error("Get Friends Error:", error);
    res.status(500).json({ error: error.message });
  }
};