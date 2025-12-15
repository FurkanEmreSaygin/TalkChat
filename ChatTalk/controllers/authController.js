const authService = require("../services/authService");
const userRepository = require("../repositories/userRepository")

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { profilePic } = req.body; 
    const updatedUser = await userRepository.updateUser(userId, profilePic)

    res.status(200).json({
      message: "Profil başarıyla güncellendi",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Güncelleme sırasında hata oluştu." });
  }
};

exports.register = async (req, res) => {
  const body = req.body;
  try {
    await authService.register(body)
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error)
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const {email, password} = req.body;
  try {
    const result = await authService.login(email, password)
    res.status(200).json({
      message: "Login Successful",
      ...result
    })

  } catch (error) {
    console.error("Login Error:", error);
    const statusCode = error.message === "Geçersiz şifre." || error.message === "Kullanıcı bulunamadı." ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
}

exports.getUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}