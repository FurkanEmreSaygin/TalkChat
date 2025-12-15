import api from "./api";

const userService = {
  getAllUsers: async () => {
    const response = await api.get("/users/getUsers");
    return response.data.users;
  },
  updateProfile: async (avatarUrl) => {
    const response = await api.put("/users/update", { profilePic: avatarUrl });
    return response.data;
  },
};

export default userService;
