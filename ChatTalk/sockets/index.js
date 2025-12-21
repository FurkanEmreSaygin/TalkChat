const registerMessageHandlers = require("./socketServices/messageHandler");
const registerFriendHandlers = require("./socketServices/friendHandler");

module.exports = (io) => {
  const onlineUsers = new Map();

  io.on("connection", async (socket) => {
    try {
      const userId = socket.user._id.toString();

      socket.join(userId);
      onlineUsers.set(userId, socket.id);

      console.log(`✅ User Online: ${socket.user.userName} (Socket ID: ${socket.id})`);
      console.log(`📊 Aktif Kullanıcı: ${onlineUsers.size}`);

      registerMessageHandlers(io, socket, onlineUsers);

      const friendLogic = registerFriendHandlers(io, socket, onlineUsers);

      await friendLogic.notifyFriendsOnConnect();

      socket.on("disconnect", async () => {
        onlineUsers.delete(userId);
        console.log(`❌ User Offline: ${socket.user.userName}`);

        await friendLogic.notifyFriendsOnDisconnect();
      });
    } catch (err) {
      console.error("Socket Connection Error:", err);
    }
  });
};
