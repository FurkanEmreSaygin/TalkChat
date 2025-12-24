import api from "./api";

const messageService = {
  getMessages: async (recipientId) => {
    const response = await api.get(`/messages/${recipientId}`);
    return response.data;
  },
  markAsRead: async (senderId) => {
    const response = await api.post("/messages/mark-read", { senderId });
    return response.data;
  },
};

export default messageService;
