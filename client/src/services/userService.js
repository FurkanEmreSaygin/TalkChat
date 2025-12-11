import api from "./api";

const userService = {
  getAllUsers: async () => {
    const response = await api.get("/users/getUsers");
    return response.data.users; 
  },
};

export default userService;
