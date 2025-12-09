const messageRepository = require("../repositories/messageRepository");

module.exports = (io) => {
  io.on("connection", (socket) => {
    
    console.log(`👤 User Connected: ${socket.user.username} (Socket ID: ${socket.id})`);

    socket.on("sendMessage", async (data) => {
      try {
        const { recipientId, content } = data;

        if (!recipientId || !content) return socket.emit("error", {message: "Recipient ID and content are required.",});

        const savedMessage = await messageRepository.createMessage(
          socket.user._id,
          recipientId,
          content
        );
       
        console.log(`Message saved: ${socket.user.username} -> ${recipientId}`,savedMessage);

        socket.emit("messageSent", {
          success: true,
          message: savedMessage
        })

      } catch (error) {
        console.error("Error handling sendMessage:", error);
        socket.emit("error", {message: "An error occurred while sending the message.",});
      }
    });

    socket.on("disconnect", () => {
      console.log(`👤 User Disconnected: ${socket.user.username} (Socket ID: ${socket.id})`);
    })
  });
};
