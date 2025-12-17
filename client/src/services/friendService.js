import api from "./api";

const friendService = {

  searchUsers: async (query) => {
    const response = await api.get(`/friends/search?query=${query}`);
    return response.data;
  },

  sendRequest: async (recipientId) => {
    const response = await api.post("/friends/request", { recipientId });
    return response.data;
  },

  getRequests: async () => {
    const response = await api.get("/friends/requests");
    return response.data;
  },

  acceptRequest: async (requestId) => {
    const response = await api.post("/friends/accept", { requestId });
    return response.data;
  },
  
  getFriends: async () => {
    const response = await api.get("/friends/list");
    return response.data;
  }
};

export default friendService;