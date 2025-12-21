const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

class AuthService {
  async register(userData) {
    const { username, email, password, phoneNumber, profilePic, publicKey, encryptedPrivateKey } = userData;

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    await userRepository.createUser({
      userName: username,
      email: email,
      password: hashedPassword,
      phoneNumber: phoneNumber || "",
      profilePic: profilePic || "",
      publicKey: publicKey || "DUMMY_PUBLIC_KEY_WAITING_FOR_FRONTEND",
      encryptedPrivateKey: encryptedPrivateKey,
    });
  }
  async login(email, password) {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User Cannot Found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Gecersiz Sifre");
    }
    const payload = { userId: user._id, userName: user.userName };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    return {
      token,
      userId: user._id,
      userName: user.userName,
      email: user.email,
      publicKey: user.publicKey,
      profilePic: user.profilePic || "",
      encryptedPrivateKey: user.encryptedPrivateKey,
    };
  }
  async updateUser(userId, profilePic) {
    return userRepository.updateUser(userId, profilePic);
  }
  async getUsers(){
    return await userRepository.getAllUsers()
  }
}

module.exports = new AuthService();
