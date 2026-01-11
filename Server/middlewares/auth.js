const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "No token provided"});
        
        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided"});

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        console.error("Validaton Error:", error)
        return res.status(400).json({ error: "Invalid Token", details: error.message });
    }
};