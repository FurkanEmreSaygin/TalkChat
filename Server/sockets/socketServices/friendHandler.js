const friendService = require("../../services/friendService");

module.exports = (io, socket, onlineUsers) => {
  const userId = socket.user._id.toString();

  const notifyFriendsOnConnect = async () => {
    try {
      const myFriends = await friendService.getFriends(userId);
      const friendsList = Array.isArray(myFriends) ? myFriends : [];

      friendsList.forEach((friend) => {
        const friendId = friend._id.toString();
        if (onlineUsers.has(friendId)) {
          io.to(friendId).emit("friendStatusUpdate", {
            userId: userId,
            status: "online",
          });
        }
      });
      const myOnlineFriends = friendsList.filter((f) => onlineUsers.has(f._id.toString())).map((f) => f._id.toString());

      socket.emit("getOnlineFriends", myOnlineFriends);
    } catch (error) {
      console.error("Notify Connect Error:", error);
    }
  };

  const notifyFriendsOnDisconnect = async () => {
    try {
      const myFriends = await friendService.getFriends(userId);
      const friendsList = Array.isArray(myFriends) ? myFriends : [];

      friendsList.forEach((friend) => {
        const friendId = friend._id.toString();
        if (onlineUsers.has(friendId)) {
          io.to(friendId).emit("friendStatusUpdate", {
            userId: userId,
            status: "offline",
          });
        }
      });
    } catch (error) {
      console.error("Notify Disconnect Error:", error);
    }
  };

  const sendFriendRequest = ({ recipientId }) => {
    const recipientSocketId = onlineUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newFriendRequest", {
        senderId: userId,
        senderName: socket.user.userName,
        senderPic: socket.user.profilePic || socket.user.avatar,
      });
      console.log(`🔔 Friend Request: ${socket.user.userName} -> ${recipientId}`);
    }
  };

  const acceptFriendRequest = ({ senderId }) => {
    const senderSocketId = onlineUsers.get(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestAccepted", {
        accepterId: userId,
        accepterName: socket.user.userName,
        accepterPic: socket.user.profilePic || socket.user.avatar,
      });
    }
  };

  socket.on("sendFriendRequest", sendFriendRequest);
  socket.on("acceptFriendRequest", acceptFriendRequest);

  return { notifyFriendsOnConnect, notifyFriendsOnDisconnect };
};
