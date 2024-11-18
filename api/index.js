const express = require("express");
const http = require("http"); // Import http module
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const initializeSocket = require("./sockets/socket"); // Import the Socket.IO config file
const path = require("path");

// Load environment variables
dotenv.config();

// Import Sequelize configuration
const sequelize = require("./Config/DBConfig");

// Import models
const User = require("./Models/User");
const Server = require("./Models/Server");
const Channel = require("./Models/Channel");
const UserServer = require("./Models/UserServer");
const UserChannel = require("./Models/UserChannel");
const Message = require("./Models/Message");
const Friendship = require("./Models/Friendship");
const DirectMessage = require("./Models/DirectMessages");

const models = { User, Server, Channel, UserServer, UserChannel, Message, Friendship, DirectMessage };

Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

const app = express();
const server = http.createServer(app);

initializeSocket(server);

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const userRoutes = require("./Routes/UserRoute");
const serverRoutes = require("./Routes/ServerRoute");
const channelRoutes = require("./Routes/ChannelRoute");
const friendshipRoutes = require("./Routes/FriendshipRoute");
const directMessageRoutes = require("./Routes/DirectMessageRoute");
const messages = require('./Routes/MessageRoute')

app.use("/api/users", userRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/friend", friendshipRoutes);
app.use("/api/direct-messages", directMessageRoutes);
app.use("/api/messages", messages);

app.get("/", (req, res) => {
    res.send("API running!");
});

app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

sequelize.sync()
    .then(() => {
        console.log("Database synchronized");

        const PORT = process.env.PORT || 4000;
        server.listen(PORT, () => {
            console.log(`====================================`);
            console.log(`Server running on port ${PORT}`);
            console.log(`====================================`);
        });
    })
    .catch(error => {
        console.error("Failed to sync database:", error);
    });
