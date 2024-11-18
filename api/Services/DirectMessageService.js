const DirectMessage = require("../Models/DirectMessages");
const User = require("../Models/User");
const { Op } = require("sequelize");

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
