const messageRepository = require("../repositories/messageRepository");

module.exports = (io) => {

  const onlineUsers = new Map();

  io.on("connection", (socket) => {

    // Store the connected user's ID and socket ID
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    
    console.log(`👤 User Connected: ${socket.user.username} (Socket ID: ${socket.id})`);
    console.log(`✅ User Online: ${socket.user.username}`);
    console.log(`📊 Aktif Kullanıcı Sayısı: ${onlineUsers.size}`);

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

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log(`👤 User Disconnected: ${socket.user.username} (Socket ID: ${socket.id})`);
      console.log(`❌ User Offline: ${socket.user.username}`);
      console.log(`📊 Aktif Kullanıcı Sayısı: ${onlineUsers.size}`);
    })
  });
};
