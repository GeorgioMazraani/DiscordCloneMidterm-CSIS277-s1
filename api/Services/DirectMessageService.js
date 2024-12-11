const DirectMessage = require("../Models/DirectMessages");
const User = require("../Models/User");
const { Op } = require("sequelize");

/**
 * Creates or retrieves an existing direct message session between two users.
 * @async
 * @function createOrGetDirectMessage
 * @param {number} user1_id - The ID of one user.
 * @param {number} user2_id - The ID of the other user.
 * @returns {Promise<Object>} The direct message record.
 * @throws {Error} Throws if either user does not exist or operation fails.
 */
const createOrGetDirectMessage = async (user1_id, user2_id) => {
    try {
        const user1Exists = await User.findByPk(user1_id);
        const user2Exists = await User.findByPk(user2_id);

        if (!user1Exists || !user2Exists) {
            throw new Error("One or both users do not exist in the database");
        }

        const [directMessage] = await DirectMessage.findOrCreate({
            where: {
                [Op.or]: [
                    { user1_id, user2_id },
                    { user1_id: user2_id, user2_id: user1_id },
                ],
            },
            defaults: { user1_id, user2_id },
        });

        return directMessage;
    } catch (error) {
        console.error("Error creating or retrieving DM session:", error.message);
        throw new Error("Failed to create or retrieve DM session");
    }
};

/**
 * Retrieves all direct message sessions a user is part of.
 * @async
 * @function getDirectMessagesByUser
 * @param {number} userId - The user's ID.
 * @returns {Promise<Array>} An array of direct message records with associated user info.
 * @throws {Error} Throws if retrieval fails.
 */
const getDirectMessagesByUser = async (userId) => {
    try {
        const directMessages = await DirectMessage.findAll({
            where: {
                [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
            },
            include: [
                { model: User, as: "User1", attributes: ["id", "username", "avatar"] },
                { model: User, as: "User2", attributes: ["id", "username", "avatar"] },
            ],
        });

        return directMessages;
    } catch (error) {
        console.error("Error retrieving DMs for user:", error.message);
        throw new Error("Failed to retrieve DMs for user");
    }
};

/**
 * Deletes the direct message session(s) between two users.
 * @async
 * @function deleteDirectMessagesBetweenUsers
 * @param {number} user1_id - The ID of one user.
 * @param {number} user2_id - The ID of the other user.
 * @returns {Promise<void>} Resolves when the deletion is complete.
 * @throws {Error} Throws if deletion fails.
 */
const deleteDirectMessagesBetweenUsers = async (user1_id, user2_id) => {
    try {
        await DirectMessage.destroy({
            where: {
                [Op.or]: [
                    { user1_id, user2_id },
                    { user1_id: user2_id, user2_id: user1_id },
                ],
            },
        });
        console.log(`Direct messages between user ${user1_id} and user ${user2_id} deleted successfully`);
    } catch (error) {
        console.error("Error deleting DMs between users:", error.message);
        throw new Error("Failed to delete DMs between users");
    }
};

module.exports = {
    createOrGetDirectMessage,
    getDirectMessagesByUser,
    deleteDirectMessagesBetweenUsers,
};
