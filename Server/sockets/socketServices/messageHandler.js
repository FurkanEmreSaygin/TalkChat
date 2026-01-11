module.exports = (io, socket, onlineUsers) => {

  const markAsRead = async ({ senderId }) => {
    const senderSocketId = onlineUsers.get(senderId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        readerId: socket.user._id.toString(),
      });
    }
  };
  
  socket.on("markMessagesAsRead", markAsRead);
};
