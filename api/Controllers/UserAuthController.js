const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
require("dotenv").config();

/**
 * Calculate the Euclidean distance between two vectors.
 * @param {number[]} v1
 * @param {number[]} v2
 * @returns {number}
 */
function euclideanDistance(v1, v2) {
    if (v1.length !== v2.length) {
        throw new Error("Vectors must be of the same length to compute Euclidean distance.");
    }
    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
        const diff = v1[i] - v2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

/**
 * Attempts to authenticate a user based on provided credentials.
 * Scenarios:
 * 1. Email + Password => Traditional login.
 * 2. Email + Face Descriptor => Face-based login for specific user.
 * 3. Only Face Descriptor => Face-based login by searching all users.
 */
const userAuthController = async (req, res) => {
    const { email, password, faceDescriptor } = req.body;

    // Case 1: Email + Password login
    if (email && password) {
        return handleEmailPasswordLogin(email, password, res);
    }

    // Case 2: Email + Face Descriptor login
    if (email && faceDescriptor) {
        return handleEmailFaceLogin(email, faceDescriptor, res);
    }

    // Case 3: Face Descriptor only login
    if (faceDescriptor && !email && !password) {
        return handleFaceOnlyLogin(faceDescriptor, res);
    }

    return res.status(400).json({ message: "Invalid login parameters. Provide email+password or face descriptor." });
};

async function handleEmailPasswordLogin(email, password, res) {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);
        return res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error("Error authenticating user:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function handleEmailFaceLogin(email, faceDescriptor, res) {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.faceDescriptor) {
            return res.status(400).json({ message: "No face registered for this user" });
        }

        const storedDescriptor = parseDescriptor(user.faceDescriptor);
        const incomingDescriptor = parseDescriptor(faceDescriptor);

        if (!compareDescriptors(storedDescriptor, incomingDescriptor)) {
            return res.status(401).json({ message: "Face does not match" });
        }

        const token = generateToken(user);
        return res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error("Error authenticating user with face:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function handleFaceOnlyLogin(faceDescriptor, res) {
    try {
        const users = await User.findAll();
        const incomingDescriptor = parseDescriptor(faceDescriptor);

        let bestMatch = null;
        let bestDistance = Infinity;
        const threshold = 0.6; // Adjust as needed

        for (const user of users) {
            if (!user.faceDescriptor) continue;

            const storedDescriptor = parseDescriptor(user.faceDescriptor);
            const distance = euclideanDistance(storedDescriptor, incomingDescriptor);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = user;
            }
        }

        // Check if best match is good enough
        if (!bestMatch || bestDistance > threshold) {
            return res.status(401).json({ message: "No matching face found" });
        }

        const token = generateToken(bestMatch);
        return res.status(200).json({ token, user: { id: bestMatch.id, username: bestMatch.username, email: bestMatch.email } });
    } catch (error) {
        console.error("Error authenticating user by face only:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * Parses a descriptor which may already be an array or a JSON string.
 */
function parseDescriptor(descriptor) {
    if (Array.isArray(descriptor)) return descriptor;
    if (typeof descriptor === 'string') return JSON.parse(descriptor);
    return descriptor;
}

/**
 * Compares two face descriptors against a set threshold.
 * Returns true if descriptors match, otherwise false.
 */
function compareDescriptors(storedDescriptor, incomingDescriptor) {
    const threshold = 0.6;
    const distance = euclideanDistance(storedDescriptor, incomingDescriptor);
    return distance <= threshold;
}

/**
 * Generates a JWT token for the user.
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}

module.exports = userAuthController;
