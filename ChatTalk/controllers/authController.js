const User = require("../models/User");
const bcrypt = require("bcryptjs");
const is = require("is_js");


exports.register = async (req, res) => {
  const body = req.body;
  try {
    if (!body.email)return res.status(400).json({ error: "Email is required" });
    if (!is.email(body.email))return res.status(400).json({ error: "Invalid email format" });

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) return res.status(400).json({ error: "This email already in use" });

    if (!body.password) return res.status(400).json({ error: "Password is required" });
    if (body.password.length < process.env.PASS_LENGTH) {
      return res.status(400).json({
          error: `Password must be at least ${process.env.PASS_LENGTH} characters`,
        });
    }
    if (!body.username)
      return res.status(400).json({ error: "Username is required" });

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(body.password, salt);

    let newUser = new User({
      userName: body.username,
      email: body.email,
      password: hashedPassword,
      phoneNumber: body.phoneNumber || "",
      profilePic: body.profilePic || "",
      publicKey: body.publicKey || "DUMMY_PUBLIC_KEY_WAITING_FOR_FRONTEND",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {

    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });

  }
};
