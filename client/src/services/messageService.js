import api from "./api";

const messageService = {
  getMessages: async (recipientId) => {
    const response = await api.get(`/messages/${recipientId}`);
    return response.data;
  },
};

export default messageService;
