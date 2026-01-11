const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
require("dotenv").config();


module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userRepository.findUserById(decodedToken.userId);

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.user = user;
    console.log("✅ Socket authenticated:", user.username);

    next(); 
  } catch (error) {
    console.error("🚫 Socket authentication error:", error.message);
    next(new Error("Authentication error"));
  }
};
