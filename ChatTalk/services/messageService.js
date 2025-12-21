const messageRepository = require("../repositories/messageRepository");

    class MessageService {
        async getMessagesBetweenUsers( senderId, recipientId ){
            console.log(`Mesajlar getiriliyor... Gönderen: ${senderId}, Alıcı: ${recipientId}`);
            
            const oldMessages = await messageRepository.getMessagesBetweenUsers(
              senderId,
              recipientId
            );

            return oldMessages
        }
        async markAsRead(senderId, recipientId){
            return await messageRepository.markAsRead(senderId, recipientId);
        }
    }
module.exports = new MessageService();
