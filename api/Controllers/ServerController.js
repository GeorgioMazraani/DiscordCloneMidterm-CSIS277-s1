const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
    createServer,
    getAllServers,
    getServerById,
    updateServerIcon,
    updateServerDetails,
    deleteServer,
    addUserToServer,
} = require('../Services/ServerServices');

const serverController = {
    // Get a server by ID
    getServerByIdController: async (req, res) => {
        const serverId = req.params.id;
        try {
            if (!serverId) return res.status(400).json({ message: 'Missing server ID' });

            const server = await getServerById(serverId);
            if (!server) {
                return res.status(404).json({ message: 'Server not found' });
            }
            res.status(200).json({ server });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get all servers
    getAllServersController: async (req, res) => {
        try {
            const servers = await getAllServers();
            res.status(200).json({ servers });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Create a new server
    createServerController: async (req, res) => {
        const { name, ownerId } = req.body;
        const icon = req.file; // Multer handles the uploaded file

        try {
            if (!name || !ownerId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // Use Multer's buffer to store the icon as a BLOB
            const iconBuffer = icon ? icon.buffer : null;

            const newServer = await createServer(name, ownerId, iconBuffer);
            res.status(201).json({ message: 'Server created successfully', server: newServer });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update server details (name only)
    updateServerDetailsController: async (req, res) => {
        const serverId = req.params.id;
        const { name } = req.body;

        try {
            if (!serverId) {
                return res.status(400).json({ message: 'Missing server ID' });
            }
            if (!name) {
                return res.status(400).json({ message: 'Missing server name' });
            }

            const updatedServer = await updateServerDetails(serverId, name);
            if (!updatedServer) {
                return res.status(404).json({ message: 'Server not found' });
            }

            res.status(200).json({ message: 'Server details updated successfully', server: updatedServer });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update server icon only
    updateServerIconController: async (req, res) => {
        const serverId = req.params.id;
        const icon = req.file; // Multer handles the uploaded file

        try {
            if (!serverId) {
                return res.status(400).json({ message: 'Missing server ID' });
            }
            if (!icon) {
                return res.status(400).json({ message: 'Missing server icon' });
            }

            const iconBuffer = icon.buffer;

            const updatedServer = await updateServerIcon(serverId, iconBuffer);
            if (!updatedServer) {
                return res.status(404).json({ message: 'Server not found' });
            }

            res.status(200).json({ message: 'Server icon updated successfully', server: updatedServer });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete a server
    deleteServerController: async (req, res) => {
        const serverId = req.params.id;

        try {
            if (!serverId) {
                return res.status(400).json({ message: 'Missing server ID' });
            }

            const deletedServer = await deleteServer(serverId);
            if (!deletedServer) {
                return res.status(404).json({ message: 'Server not found' });
            }

            res.status(200).json({ message: 'Server deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Add a user to a server
    addUserToServerController: async (req, res) => {
        const { serverId, inviterId, inviteeId } = req.body;

        try {
            if (!serverId || !inviterId || !inviteeId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const updatedServer = await addUserToServer(serverId, inviterId, inviteeId);
            res.status(200).json({ message: 'User added to server successfully', server: updatedServer });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = { serverController, upload };
