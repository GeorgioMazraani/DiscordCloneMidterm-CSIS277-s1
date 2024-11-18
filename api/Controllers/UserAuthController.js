// Controllers/UserAuthController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
require("dotenv").config();

const userAuthController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Missing email or password" });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Invalid email or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(404).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error("Error authenticating user:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = userAuthController;
