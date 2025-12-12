import api from "./api";

const authService = {
  // Login İsteği
  login: async (email, password) => {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  },

  // Register İsteği
  register: async (username, email, password, publicKey) => {
    const response = await api.post("/users/register", {
      username,
      email,
      password,
      publicKey
    });
    return response.data;
  },
};

export default authService;
