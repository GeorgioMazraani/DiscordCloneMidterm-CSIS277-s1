const Server = require("../Models/Server");
const User = require("../Models/User");
const Channel = require("../Models/Channel");
const Friendship = require("../Models/Friendship");

/**
 * Creates a new server with a default "General text" and "General voice" channel.
 * @async
 * @function createServer
 * @param {string} name - The name of the server.
 * @param {number} ownerId - The ID of the server's owner.
 * @param {Buffer|null} [icon=null] - Optional server icon.
 * @returns {Promise<Object>} The created server object.
 * @throws {Error} Throws an error if server creation fails.
 */
const createServer = async (name, ownerId, icon = null) => {
    try {
        const newServer = await Server.create({
            name,
            owner_id: ownerId,
            icon: icon || null,
            created_at: new Date(),
            updated_at: new Date(),
        });

        await Channel.bulkCreate([
            {
                name: "General text",
                type: "text",
                server_id: newServer.id,
                is_private: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "General voice",
                type: "voice",
                server_id: newServer.id,
                is_private: false,
                created_at: new Date(),
                updated_at: new Date(),
            }
        ]);

        return newServer;
    } catch (error) {
        console.error("Error creating server:", error);
        throw new Error("Failed to create server");
    }
};

/**
 * Retrieves all servers along with their owner, channels, and members.
 * @async
 * @function getAllServers
 * @returns {Promise<Array>} An array of server objects with associated data.
 * @throws {Error} Throws an error if retrieval fails.
 */
const getAllServers = async () => {
    try {
        const servers = await Server.findAll({
            include: [
                {
                    model: User,
                    as: "Owner",
                    attributes: ["id", "username", "email"],
                },
                {
                    model: Channel,
                    as: "Channels",
                    attributes: ["id", "name", "type"],
                },
                {
                    model: User,
                    as: "Members",
                    attributes: ["id", "username", "email"],
                    through: { attributes: [] }
                }
            ],
        });
        return servers;
    } catch (error) {
        console.error("Error retrieving servers:", error);
        throw new Error("Failed to retrieve servers");
    }
};

/**
 * Retrieves a server by its ID, including owner, channels, and members.
 * @async
 * @function getServerById
 * @param {number} id - The server ID.
 * @returns {Promise<Object>} The server object.
 * @throws {Error} Throws an error if server is not found or retrieval fails.
 */
const getServerById = async (id) => {
    try {
        const server = await Server.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "Owner",
                    attributes: ["id", "username", "email"],
                },
                {
                    model: Channel,
                    as: "Channels",
                    attributes: ["id", "name", "type"],
                },
                {
                    model: User,
                    as: "Members",
                    attributes: ["id", "username", "email"],
                    through: { attributes: [] }
                }
            ],
        });
        if (!server) throw new Error(`Server with ID ${id} not found`);
        return server;
    } catch (error) {
        console.error("Error retrieving server by ID:", error);
        throw new Error("Failed to retrieve server");
    }
};

/**
 * Updates a server's details, specifically its name.
 * @async
 * @function updateServerDetails
 * @param {number} id - The server ID.
 * @param {string} name - The new server name.
 * @returns {Promise<Object>} The updated server object.
 * @throws {Error} Throws an error if update fails or server not found.
 */
const updateServerDetails = async (id, name) => {
    try {
        const updated = await Server.update(
            {
                name: name,
                updated_at: new Date(),
            },
            {
                where: { id },
            }
        );
        if (!updated[0]) throw new Error(`Server with ID ${id} not found`);
        return await getServerById(id);
    } catch (error) {
        console.error("Error updating server details:", error);
        throw new Error("Failed to update server details");
    }
};

/**
 * Updates a server's icon.
 * @async
 * @function updateServerIcon
 * @param {number} id - The server ID.
 * @param {Buffer|null} icon - The new server icon.
 * @returns {Promise<Object>} The updated server object.
 * @throws {Error} Throws an error if update fails or server not found.
 */
const updateServerIcon = async (id, icon) => {
    try {
        const updated = await Server.update(
            {
                icon: icon || null,
                updated_at: new Date(),
            },
            {
                where: { id },
            }
        );
        if (!updated[0]) throw new Error(`Server with ID ${id} not found`);
        return await getServerById(id);
    } catch (error) {
        console.error("Error updating server icon:", error);
        throw new Error("Failed to update server icon");
    }
};

/**
 * Deletes a server and all its associated channels.
 * @async
 * @function deleteServer
 * @param {number} id - The server ID.
 * @returns {Promise<Object>} A success message.
 * @throws {Error} Throws an error if deletion fails or server not found.
 */
const deleteServer = async (id) => {
    try {
        const server = await Server.findByPk(id, {
            include: [
                {
                    model: Channel,
                    as: "Channels",
                    attributes: ["id"],
                },
            ],
        });

        if (!server) {
            throw new Error(`Server with ID ${id} not found`);
        }

        const channelIds = server.Channels.map(channel => channel.id);
        if (channelIds.length > 0) {
            await Channel.destroy({
                where: {
                    id: channelIds,
                },
            });
        }

        await server.destroy();
        return { message: "Server and its channels deleted successfully" };
    } catch (error) {
        console.error("Error deleting server:", error);
        throw new Error("Failed to delete server");
    }
};

/**
 * Adds a user to a server, ensuring they are friends with the inviter.
 * @async
 * @function addUserToServer
 * @param {number} serverId - The server ID.
 * @param {number} inviterId - The ID of the user who invites.
 * @param {number} inviteeId - The ID of the user being invited.
 * @returns {Promise<Object>} The updated server object with the new member.
 * @throws {Error} Throws an error if users are not friends or if retrieval fails.
 */
const addUserToServer = async (serverId, inviterId, inviteeId) => {
    try {
        const server = await Server.findByPk(serverId);
        const inviter = await User.findByPk(inviterId);
        const invitee = await User.findByPk(inviteeId);

        if (!server) {
            throw new Error(`Server with ID ${serverId} not found`);
        }
        if (!inviter) {
            throw new Error(`User (inviter) with ID ${inviterId} not found`);
        }
        if (!invitee) {
            throw new Error(`User (invitee) with ID ${inviteeId} not found`);
        }

        const friendship = await Friendship.findOne({
            where: {
                user_id: inviterId,
                friend_id: inviteeId,
                status: "accepted",
            },
        });

        if (!friendship) {
            throw new Error("Users must be friends to invite to the server");
        }

        await server.addMember(invitee);

        const publicChannels = await Channel.findAll({
            where: {
                server_id: serverId,
                is_private: false,
            },
        });

        for (const channel of publicChannels) {
            await channel.addParticipant(invitee);
        }

        return await getServerById(serverId);
    } catch (error) {
        console.error("Error adding user to server:", error);
        throw new Error("Failed to add user to server");
    }
};

module.exports = {
    createServer,
    getAllServers,
    getServerById,
    updateServerDetails,
    deleteServer,
    updateServerIcon,
    addUserToServer,
};
