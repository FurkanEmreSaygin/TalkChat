const messageRepository = require("../repositories/messageRepository");
const friendService = require("../services/friendService")

module.exports = (io) => {

  const onlineUsers = new Map();

  io.on("connection", async (socket) => {
    // Store the connected user's ID and socket ID
    const userId = socket.user._id.toString();
    socket.join(userId);
    onlineUsers.set(userId, socket.id);

    console.log(`👤 User Connected: ${socket.user.userName} (Socket ID: ${socket.id})`);
    console.log(`✅ User Online: ${socket.user.userName}`);
    console.log(`📊 Aktif Kullanıcı Sayısı: ${onlineUsers.size}`);

    try {
      const myFriends = await friendService.getFriends(userId);
      const friendsList = Array.isArray(myFriends) ? myFriends : [];

      friendsList.forEach(friend => {
        const friendId = friend._id.toString();

        if (onlineUsers.has(friendId)) {
          io.to(friendId).emit("friendStatusUpdate", {
            userId: userId,
            status: "online"
          });
        }
      });
      const myOnlineFriends = friendsList.filter(f => onlineUsers.has(f._id.toString())).map(f => f._id.toString());

      socket.emit("getOnlineFriends", myOnlineFriends);

    } catch (error) {
      console.error("Socket friend notification error:", error);
    }

    socket.on("sendMessage", async (data) => {

      try {
        const { recipientId, content, senderContent } = data;

        if (!recipientId || !content || !senderContent) return socket.emit("error", { message: "Recipient ID and content are required.", });

        const savedMessage = await messageRepository.createMessage(
          socket.user._id,
          recipientId,
          content,
          senderContent
        );

        console.log(`Message saved: ${socket.user.username} -> ${recipientId}`, savedMessage);



        socket.emit("messageSent", { success: true, message: savedMessage })

        const recipientSocketId = onlineUsers.get(recipientId);

        if (recipientSocketId) {
          io.to(recipientSocketId).emit("newMessage", savedMessage);
          console.log(`📨 New message sent to ${recipientId} (Socket ID: ${recipientSocketId})`);
        }
        else {
          console.log(`📭 User ${recipientId} is offline. Message will be delivered when they come online.`);
        }

      } catch (error) {
        console.error("Error handling sendMessage:", error);
        socket.emit("error", { message: "An error occurred while sending the message.", });
      }
    });
    socket.on("sendFriendRequest", ({ recipientId }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newFriendRequest", {
          senderId: userId,
          senderName: socket.user.userName,
          senderPic: socket.user.profilePic || socket.user.avatar
        });
        console.log(`🔔 İstek iletildi: ${socket.user.username} -> ${recipientId}`);
      }
    });

    socket.on("acceptFriendRequest", ({ senderId }) => {
      const senderSocketId = onlineUsers.get(senderId);

      if (senderSocketId) {
        io.to(senderSocketId).emit("friendRequestAccepted", {
          accepterId: userId,
          accepterName: socket.user.userName,
          accepterPic: socket.user.profilePic || socket.user.avatar
        });
      }
    });
    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      console.log(`👤 User Disconnected: ${socket.user.userName} (Socket ID: ${socket.id})`);
      console.log(`❌ User Offline: ${socket.user.userName}`);
      console.log(`📊 Aktif Kullanıcı Sayısı: ${onlineUsers.size}`);
      try {
        const myFriends = await friendService.getFriends(userId);
        const friendsList = Array.isArray(myFriends) ? myFriends : [];

        friendsList.forEach(friend => {
          const friendId = friend._id.toString();
          if (onlineUsers.has(friendId)) {
            io.to(friendId).emit("friendStatusUpdate", {
              userId: userId,
              status: "offline"
            });
          }
        });
      } catch (e) { console.error(e); }
    })
  });
};
