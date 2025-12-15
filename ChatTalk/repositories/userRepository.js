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
}

module.exports = new UserRepository();