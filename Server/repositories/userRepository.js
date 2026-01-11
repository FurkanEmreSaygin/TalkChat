const User = require("../models/User")

class UserRepository {
  async findUserByEmail(email) {
    return await User.findOne({ email });
  }
  async findUserById(id) {
    return await User.findById(id);
  }
  async createUser(userData) {
    const newUser = new User(userData);
    return await newUser.save();
  }
  async getAllUsers() {
    return await User.find({}).select("-password -__v");
  }
  async updateUser(userId, avatar) {
    return await User.findByIdAndUpdate(userId, { profilePic: avatar }, { new: true }).select("-password -encryptedPrivateKey");  
  }
  async searchUsers(query, currentUserId) {
    return await User.find({
      userName: { $regex: query, $options: "i" }, _id: { $ne: currentUserId }}).select("userName profilePic avatar _id");
  } 
  async addFriendToUser(userId, friendId) {
    return await User.findByIdAndUpdate( userId, { $addToSet: { friends: friendId } }, { new: true });
  }
  async getUserFriends(userId) {
      const user = await User.findById(userId).populate("friends", "userName profilePic avatar publicKey");
      return user ? user.friends : [];
  }
}

module.exports = new UserRepository();