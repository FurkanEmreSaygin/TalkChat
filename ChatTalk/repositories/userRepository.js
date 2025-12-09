const User = require("../models/User")

class UserRepository {
    async findUserByEmail(email) {
        return await User.findOne({ email});
    }
    async findUserById(id){
        return await User.findById(id);
    }
    async createUser(userData) {
        const newUser = new User(userData);
        return await newUser.save();
    }
    async getAllUsers() {
        return await User.find({});
    }
}

module.exports = new UserRepository();