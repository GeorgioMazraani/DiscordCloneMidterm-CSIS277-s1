const User = require("../Models/User");
const bcrypt = require("bcrypt");
const saltRounds = 10;

/**
 * Creates a new user with the provided credentials.
 * @async
 * @function createUser
 * @param {string} username - The desired username for the new user.
 * @param {string} email - The email address of the new user.
 * @param {string} password - The plaintext password which will be hashed.
 * @param {Buffer|null} avatar - An optional avatar image (as a Buffer) for the new user.
 * @returns {Promise<Object>} Returns the created user object.
 * @throws {Error} Throws an error if user creation fails.
 */
const createUser = async (username, email, password, avatar) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword,
            avatar: avatar || null,
            created_at: new Date(),
            updated_at: new Date(),
        });

        return newUser;
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
    }
};

/**
 * Retrieves all users with selected attributes.
 * @async
 * @function getAllUsers
 * @returns {Promise<Array>} An array of user objects with specified attributes.
 * @throws {Error} Throws an error if retrieval fails.
 */
const getAllUsers = async () => {
    try {
        const users = await User.findAll({
            attributes: [
                ["id", "ID"],
                ["email", "Email"],
                ["username", "Username"],
                ["avatar", "Avatar"],
                ["status", "Status"],
                ["faceDescriptor", "FaceDescriptor"],
            ],
        });

        return users;
    } catch (error) {
        console.error("Error retrieving users:", error);
        throw new Error("Failed to retrieve users");
    }
};

/**
 * Retrieves a user by their ID.
 * @async
 * @function getUserById
 * @param {number} id - The ID of the user to retrieve.
 * @returns {Promise<Object|null>} The user object or null if not found.
 * @throws {Error} Throws an error if retrieval fails.
 */
const getUserById = async (id) => {
    try {
        const user = await User.findByPk(id);

        if (!user) {
            return null;
        }

        if (user.avatar) {
            user.avatar = `data:image/jpeg;base64,${user.avatar.toString('base64')}`;
        }
        return user;
    } catch (error) {
        console.error("Error retrieving user by ID:", error);
        throw new Error("Failed to retrieve user");
    }
};

/**
 * Retrieves a user by their email address.
 * @async
 * @function getUserByEmail
 * @param {string} email - The email of the user to retrieve.
 * @returns {Promise<Object|null>} The user object or null if not found.
 * @throws {Error} Throws an error if retrieval fails.
 */
const getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ where: { email } });
        return user || null;
    } catch (error) {
        console.error(`Error finding user with email ${email}:`, error);
        throw new Error("Failed to retrieve user");
    }
};

/**
 * Updates a user's details such as username, email, password, avatar, status, and audio settings.
 * @async
 * @function updateUser
 * @param {number} id - The user ID to update.
 * @param {string} username - The new username.
 * @param {string} email - The new email address.
 * @param {string|null} password - The new plaintext password (if provided).
 * @param {Buffer|null} avatar - The new avatar (if provided).
 * @param {string|null} status - The user's new status (if provided).
 * @param {boolean} [isMuted] - Whether the user is muted.
 * @param {boolean} [isHeadphonesOn] - Whether the user is using headphones.
 * @returns {Promise<Array>} Returns an array with the number of affected rows.
 * @throws {Error} Throws an error if update fails.
 */
const updateUser = async (id, username, email, password, avatar, status, isMuted, isHeadphonesOn) => {
    try {
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }
        const updateData = {
            username,
            email,
            avatar,
            status,
            updated_at: new Date(),
        };

        if (hashedPassword) {
            updateData.password = hashedPassword;
        }

        if (typeof isMuted !== 'undefined') {
            updateData.isMuted = isMuted;
        }

        if (typeof isHeadphonesOn !== 'undefined') {
            updateData.isHeadphonesOn = isHeadphonesOn;
        }

        const updated = await User.update(updateData, {
            where: { id },
            individualHooks: true,
        });

        return updated;
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
    }
};

/**
 * Deletes a user by their ID.
 * @async
 * @function deleteUser
 * @param {number} id - The ID of the user to delete.
 * @returns {Promise<Object>} Returns the deleted user object.
 * @throws {Error} Throws an error if deletion fails or user not found.
 */
const deleteUser = async (id) => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }
        await user.destroy();
        return user;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete user");
    }
};

/**
 * Retrieves a user by their username.
 * @async
 * @function getUserByUsername
 * @param {string} username - The username to search for.
 * @returns {Promise<Object|null>} The user object or null if not found.
 * @throws {Error} Throws an error if retrieval fails.
 */
const getUserByUsername = async (username) => {
    try {
        const user = await User.findOne({ where: { username } });
        return user || null;
    } catch (error) {
        console.error(`Error finding user with username ${username}:`, error);
        throw new Error("Failed to retrieve user by username");
    }
};

/**
 * Updates a user's avatar.
 * @async
 * @function updateAvatar
 * @param {number} id - The user ID.
 * @param {Buffer|null} avatar - The new avatar image as a buffer.
 * @returns {Promise<Array>} Returns an array indicating the number of rows updated.
 * @throws {Error} Throws an error if update fails.
 */
const updateAvatar = async (id, avatar) => {
    try {
        const updateData = {
            avatar,
            updated_at: new Date(),
        };

        const updatedUser = await User.update(updateData, {
            where: { id },
            individualHooks: true,
        });

        return updatedUser;
    } catch (error) {
        console.error("Error updating avatar:", error);
        throw new Error("Failed to update avatar");
    }
};

/**
 * Changes a user's password after verifying the current one.
 * @async
 * @function changePassword
 * @param {number} id - The user ID.
 * @param {string} currentPassword - The current plaintext password.
 * @param {string} newPassword - The new plaintext password.
 * @returns {Promise<Object>} A success message.
 * @throws {Error} Throws an error if verification fails or update fails.
 */
const changePassword = async (id, currentPassword, newPassword) => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error("Current password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        await user.save();

        return { message: "Password changed successfully" };
    } catch (error) {
        console.error("Error changing password:", error);
        throw new Error("Failed to change password");
    }
};

/**
 * Registers face recognition data (face descriptor) for a user.
 * @async
 * @function registerFaceRecognition
 * @param {number} id - The user ID.
 * @param {Array|Object|string} faceDescriptor - The face recognition data (descriptor).
 * @returns {Promise<Object>} A success message.
 * @throws {Error} Throws an error if update fails or user not found.
 */
const registerFaceRecognition = async (id, faceDescriptor) => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }
        user.faceDescriptor = Array.isArray(faceDescriptor)
            ? JSON.stringify(faceDescriptor)
            : faceDescriptor;
        user.updated_at = new Date();
        await user.save();

        return { message: "Face recognition data registered successfully" };
    } catch (error) {
        console.error("Error registering face recognition:", error);
        throw new Error("Failed to register face recognition");
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
    getUserByUsername,
    updateAvatar,
    changePassword,
    registerFaceRecognition
};
