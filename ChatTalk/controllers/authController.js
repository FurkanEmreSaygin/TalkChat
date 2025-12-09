const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

exports.register = async (req, res) => {
  const body = req.body;
  try {
    const { username, email, password, phoneNumber, profilePic, publicKey } =body;
    //sonradan busniess logice tasinacak
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    await userRepository.createUser({
      userName: username,
      email: email,
      password: hashedPassword,
      phoneNumber: phoneNumber || "",
      profilePic: profilePic || "",
      publicKey: publicKey || "DUMMY_PUBLIC_KEY_WAITING_FOR_FRONTEND",
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {

    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });

  }
};

exports.login = async (req, res) => {
  const {email, password} = req.body;
  //sonradan busniess logice tasinacak
  try {

    const user = await userRepository.findUserByEmail(email);
    
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

   // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) return res.status(400).json({ error: "Invalid email or password" });

    // Successful login
    const payload = {userId :user._id , userName: user.userName};
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});

    res.status(200).json({
      message: "Login successful",
      token: token,
      userId : user._id
    })

  } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
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