const is = require("is_js");
const userRepository = require("../repositories/userRepository")


exports.validateRegister = async (req, res, next) => {
    const { email, password, username } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!username) return res.status(400).json({ error: "Username is required" });
    if (!password) return res.status(400).json({ error: "Password is required" });

    if (!is.email(email)) return res.status(400).json({ error: "Invalid email format" });

    if (password.length < process.env.PASS_LENGTH) {
        return res.status(400).json({
            error: `Password must be at least ${process.env.PASS_LENGTH} characters`,
        });
    }

    try {
        const existingUser = await userRepository.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "This email already in use" });
        }
    } catch (error) {
        console.error("Validaton Error:", error)
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
    next();
};
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!is.email(email))
    return res.status(400).json({ error: "Invalid email format" });
  if (!password) return res.status(400).json({ error: "Password is required" });

  next();
};