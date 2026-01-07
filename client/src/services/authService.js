import api from "./api";

const authService = {
  // Login İsteği
  login: async (email, password) => {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  },

  // Register İsteği
  register: async (userName, email, password, publicKey, encryptedPrivateKey) => {
    const response = await api.post("/users/register", {
      userName,
      email,
      password,
      publicKey,
      encryptedPrivateKey,
    });
    return response.data;
  },
};

export default authService;
