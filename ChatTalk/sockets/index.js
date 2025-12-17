const messageRepository = require("../repositories/messageRepository");

module.exports = (io) => {

  const onlineUsers = new Map();

  io.on("connection", (socket) => {

    // Store the connected user's ID and socket ID
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    
    console.log(`👤 User Connected: ${socket.user.userName} (Socket ID: ${socket.id})`);
    console.log(`✅ User Online: ${socket.user.userName}`);
    console.log(`📊 Aktif Kullanıcı Sayısı: ${onlineUsers.size}`);
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    socket.on("sendMessage", async (data) => {
      
      try {
        const { recipientId, content, senderContent } = data;

        if (!recipientId || !content || !senderContent) return socket.emit("error", {message: "Recipient ID and content are required.",});

        const savedMessage = await messageRepository.createMessage(
          socket.user._id,
          recipientId,
          content,
          senderContent
        );
       
        console.log(`Message saved: ${socket.user.username} -> ${recipientId}`,savedMessage);

        

        socket.emit("messageSent", {success: true,message: savedMessage})
        
        const recipientSocketId = onlineUsers.get(recipientId);

        if (recipientSocketId){
          io.to(recipientSocketId).emit("newMessage", savedMessage);
          console.log(`📨 New message sent to ${recipientId} (Socket ID: ${recipientSocketId})`);
        }
        else{
          console.log(`📭 User ${recipientId} is offline. Message will be delivered when they come online.`);
        }

      } catch (error) {
        console.error("Error handling sendMessage:", error);
        socket.emit("error", {message: "An error occurred while sending the message.",});
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
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log(`👤 User Disconnected: ${socket.user.userName} (Socket ID: ${socket.id})`);
      console.log(`❌ User Offline: ${socket.user.userName}`);
      console.log(`📊 Aktif Kullanıcı Sayısı: ${onlineUsers.size}`);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    })
  });
};
