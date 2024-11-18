const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {
    createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    getUserByUsername,
    updateUser,
    deleteUser,
    updateAvatar,
    changePassword
} = require("../Services/UserServices");

const usersController = {
    // Get a user by ID
    getUserByIdController: async (req, res) => {
        const userId = req.params.id;
        try {
            if (!userId) return res.status(400).json({ message: "Missing user ID" });

            const user = await getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get all users
    getAllUsersController: async (req, res) => {
        try {
            const users = await getAllUsers();
            res.status(200).json({ users });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get a user by username
    getUserByUsernameController: async (req, res) => {
        const { username } = req.params;
        try {
            if (!username) return res.status(400).json({ message: "Missing username" });

            const user = await getUserByUsername(username);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getUserByEmailController: async (req, res) => {
        const { email } = req.params;
        try {
            if (!email) return res.status(400).json({ message: "Missing email" });

            const user = await getUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Create a new user
    createUserController: async (req, res) => {
        const { username, email, password, avatar } = req.body;
        try {
            if (!username || !email || !password) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            // Check if email already exists
            const existingUser = await getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "User with this email already exists" });
            }

            const newUser = await createUser(username, email, password, avatar);
            res.status(201).json({ message: "User created successfully", user: newUser });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateUserController: async (req, res) => {
        const userId = req.params.id;
        const { username, email, password, avatar, status, isMuted, isHeadphonesOn } = req.body;

        try {
            if (!userId) {
                return res.status(400).json({ message: "Missing user ID" });
            }

            // Pass isMuted and isHeadphonesOn to the updateUser service
            const updatedUser = await updateUser(userId, username, email, password, avatar, status, isMuted, isHeadphonesOn);

            if (!updatedUser) {
                return res.status(500).json({ message: "Failed to update user" });
            }

            res.status(200).json({ message: "User updated successfully", user: updatedUser });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Delete a user
    deleteUserController: async (req, res) => {
        const userId = req.params.id;

        try {
            if (!userId) {
                return res.status(400).json({ message: "Missing user ID" });
            }

            const deletedUser = await deleteUser(userId);
            if (!deletedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    updateAvatarController: async (req, res) => {
        const userId = req.params.id;
        const { avatar } = req.body; // Access the avatar Base64 string from the request body

        try {
            if (!userId) {
                return res.status(400).json({ message: "Missing user ID" });
            }
            if (!avatar) {
                return res.status(400).json({ message: "Avatar data is required" });
            }

            // Decode the Base64 string to binary
            const avatarBuffer = Buffer.from(avatar.replace(/^data:image\/\w+;base64,/, ""), "base64");

            // Update the avatar in the database
            const updatedUser = await updateAvatar(userId, avatarBuffer);

            if (!updatedUser) {
                return res.status(500).json({ message: "Failed to update avatar" });
            }

            res.status(200).json({ message: "Avatar updated successfully", user: updatedUser });
        } catch (error) {
            console.error("Error updating avatar:", error);
            res.status(500).json({ error: error.message });
        }
    },
    changePasswordController: async (req, res) => {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;

        try {
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: "Both current and new passwords are required" });
            }

            const result = await changePassword(userId, currentPassword, newPassword);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = { usersController, upload };
