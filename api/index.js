const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const initializeSocket = require("./sockets/socket"); // Custom WebSocket configuration
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swaggerOptions");

// Load environment variables from a .env file
dotenv.config();

// Import Sequelize configuration
const sequelize = require("./Config/DBConfig");

// Import database models
const User = require("./Models/User");
const Server = require("./Models/Server");
const Channel = require("./Models/Channel");
const UserServer = require("./Models/UserServer");
const UserChannel = require("./Models/UserChannel");
const Message = require("./Models/Message");
const Friendship = require("./Models/Friendship");
const DirectMessage = require("./Models/DirectMessages");

// Associate models with their relationships
const models = { User, Server, Channel, UserServer, UserChannel, Message, Friendship, DirectMessage };

Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

const app = express(); // Initialize Express application
const server = http.createServer(app); // Create an HTTP server for Express and WebSocket

// Initialize WebSocket functionality
initializeSocket(server);

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json({ limit: '10mb' })); // Parse JSON requests with a size limit of 10 MB
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Parse URL-encoded requests
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files for uploaded content

// Import and configure API routes
const userRoutes = require("./Routes/UserRoute");
const serverRoutes = require("./Routes/ServerRoute");
const channelRoutes = require("./Routes/ChannelRoute");
const friendshipRoutes = require("./Routes/FriendshipRoute");
const directMessageRoutes = require("./Routes/DirectMessageRoute");
const messages = require("./Routes/MessageRoute");

// Register routes with their base paths
app.use("/api/users", userRoutes); // User-related endpoints
app.use("/api/servers", serverRoutes); // Server-related endpoints
app.use("/api/channels", channelRoutes); // Channel-related endpoints
app.use("/api/friend", friendshipRoutes); // Friendship-related endpoints
app.use("/api/direct-messages", directMessageRoutes); // Direct message-related endpoints
app.use("/api/messages", messages); // Messaging-related endpoints

// Swagger documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Access API documentation at /api-docs

// Root endpoint to confirm the API is running
app.get("/", (req, res) => {
    res.send("API running!");
});

// 404 Error handler for unmatched routes
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

// General error handler for server errors
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).send("Something broke!"); // Send a generic error message
});

// Synchronize database and start the server
sequelize.sync() // Synchronize Sequelize models with the database
    .then(() => {
        console.log("Database synchronized"); // Log success message

        const PORT = process.env.PORT || 4000; // Use port from environment variables or default to 4000
        server.listen(PORT, () => { // Start the server
            console.log(`====================================`);
            console.log(`Server running on port ${PORT}`);
            console.log(`====================================`);
        });
    })
    .catch(error => {
        console.error("Failed to sync database:", error); // Log database sync error
    });
