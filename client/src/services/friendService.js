import api from "./api";

const friendService = {
  // --- 1. KULLANICI ARAMA ---
  searchUsers: async (query) => {
    const response = await api.get(`/friends/search?query=${query}`);
    return response.data;
  },
  // --- 2. ARKADAŞLIK İSTEĞİ GÖNDERME ---
  sendFriendRequest: async (recipientId) => {
    const response = await api.post("/friends/request", { recipientId });
    return response.data;
  },
  // --- 3. İSTEĞİ KABUL ETME  ---
  acceptFriendRequest: async (requestId) => {
    const response = await api.post("/friends/accept", { requestId });
    return response.data;
  },
  // --- 4. BEKLEYEN İSTEKLERİ GETİR  ---
  getPendingRequests: async () => {
    const response = await api.get("/friends/requests");
    return response.data;
  },
  // --- 5. ARKADAŞ LİSTESİNİ GETİR ---
  getFriends: async () => {
    const response = await api.get("/friends/list");
    return response.data;
  },
};

export default friendService;
