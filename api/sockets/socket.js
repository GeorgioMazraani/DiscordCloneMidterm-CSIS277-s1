const { Server } = require("socket.io");
const messageService = require("../Services/MessageService");
const User = require("../Models/User");
const DirectMessageService = require("../Services/DirectMessageService")

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        // Handle joining a specific DM or channel room
        socket.on("joinChannel", (room) => {
            if (!room) {
                console.error("Room name is required for joinChannel");
                return;
            }
            socket.join(room);
            console.log(`User ${socket.id} joined room ${room}`);
        });

        socket.on('sendMessage', async (data) => {
            const { content, senderId, dmId, channelId, tempId } = data;

            // Validate required fields
            if (!content || typeof content !== 'string') {
                console.error('Content must be a non-empty string.');
                return;
            }

            if (!senderId) {
                console.error('Sender ID cannot be null.');
                return;
            }

            if (!dmId && !channelId) {
                console.error('Either dmId or channelId must be provided.');
                return;
            }

            try {
                // Save the message to the database
                const message = await messageService.createMessage({
                    content,
                    timestamp: new Date(),
                    sender_id: senderId,
                    dm_id: dmId || null,
                    channel_id: channelId || null,
                });

                // Find sender's username
                const sender = await User.findByPk(senderId, { attributes: ['username'] });
                const roomId = dmId ? `dm-${dmId}` : `channel-${channelId}`;

                // Emit acknowledgment back to the sender
                socket.emit('messageAcknowledged', {
                    ...message.toJSON(),
                    tempId, // Include tempId to match and replace on the client side
                });

                // Broadcast the message to the specific room
                io.to(roomId).emit('receiveMessage', {
                    ...message.toJSON(),
                    senderUsername: sender ? sender.username : 'Unknown',
                });

                // Notify all other connected users about the new message (global notification)
                socket.broadcast.emit('receiveNotification', {
                    ...message.toJSON(),
                    senderUsername: sender ? sender.username : 'Unknown',
                    dmId, // Include dmId for the client to match and handle
                });

                console.log(`Message sent to room ${roomId}:`, message.toJSON());
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });


        socket.on('deleteMessage', async (messageId) => {
            try {
                await messageService.deleteMessage(messageId);

                // Broadcast the deletion to all clients in the room
                io.emit('messageDeleted', messageId);
            } catch (error) {
                console.error('Failed to delete message:', error);
            }
        });

        // Handle leaving a specific DM or channel room
        socket.on("leaveChannel", (room) => {
            if (!room) {
                console.error("Room name is required for leaveChannel");
                return;
            }
            socket.leave(room);
            console.log(`User ${socket.id} left room ${room}`);
        });

        // Handle user disconnecting
        socket.on("disconnect", () => {
            console.log("A user disconnected:", socket.id);
        });
    });

    return io;
};

module.exports = initializeSocket;
