/**
 * FriendChat.js
 * 
 * This component provides a chat interface for direct messaging (DM) between the logged-in user 
 * and a selected friend. It supports real-time messaging via WebSocket (socket.io) and includes 
 * features such as displaying chat history, sending and deleting messages, and handling message 
 * acknowledgments from the server.
 * 
 * Key Functionalities:
 * - Fetches chat history and friend details from the backend.
 * - Displays messages with timestamps, including date headers for new days.
 * - Sends new messages in real-time via WebSocket.
 * - Supports deleting sent messages.
 * - Automatically scrolls to the latest message.
 * 
 * Props:
 * - `friend`: Object containing the friend's details (e.g., ID, username).
 * - `userId`: ID of the logged-in user.
 * - `dmId`: ID of the direct message (DM) thread.
 */

import React, { useState, useEffect, useRef } from 'react';
import './FriendChat.css';
import socket from '../../Utils/socket';
import UserService from '../../Services/UserService';
import DirectMessageService from '../../Services/DirectMessageService';
import defaultAv from '../Assets/default.jpg'
import { FaTrash } from "react-icons/fa6";
const FriendChat = ({ friend, userId, dmId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [friendAvatar, setFriendAvatar] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        const fetchFriendDetails = async () => {
            try {
                const response = await UserService.getUserById(friend.id);
                if (response.data.user.avatar) {
                    setFriendAvatar(response.data.user.avatar);
                } else {
                    setFriendAvatar(defaultAv);
                }
            } catch (error) {
                console.error('Error fetching friend details:', error);
            }
        };

        const fetchMessagesWithUsernames = async () => {
            try {
                const response = await DirectMessageService.getMessagesByDM(dmId);
                const messagesWithUsernames = await Promise.all(
                    response.data.map(async (msg) => {
                        const userResponse = await UserService.getUserById(msg.sender_id);
                        const senderUsername = userResponse.data.user.username;

                        return {
                            ...msg,
                            senderId: msg.sender_id,
                            senderUsername,
                            timestamp: new Date(msg.timestamp),
                        };
                    })
                );

                messagesWithUsernames.sort((a, b) => a.timestamp - b.timestamp);
                setMessages(messagesWithUsernames);
            } catch (error) {
                console.error('Error fetching messages with usernames:', error);
            }
        };

        fetchFriendDetails();
        fetchMessagesWithUsernames();

        socket.emit('joinChannel', `dm-${dmId}`);

        socket.on('receiveMessage', (message) => {
            message.timestamp = new Date(message.timestamp);
            setMessages((prevMessages) => {
                const isDuplicate = prevMessages.some((msg) => msg.id === message.id);
                if (isDuplicate) return prevMessages;

                const updatedMessages = [...prevMessages, message];
                return updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
            });
        });

        socket.on('messageDeleted', (messageId) => {
            setMessages((prevMessages) => prevMessages.filter((message) => message.id !== messageId));
        });

        return () => {
            socket.emit('leaveChannel', `dm-${dmId}`);
            socket.off('receiveMessage');
            socket.off('messageDeleted');
        };
    }, [friend.id, dmId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (newMessage.trim() === '') return;

        const tempId = `temp-${Date.now()}`;
        const messageData = {
            content: newMessage,
            senderId: Number(userId),
            dmId,
            senderUsername: 'You',
            timestamp: new Date(),
            tempId,
        };

        socket.emit('sendMessage', messageData);

        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, messageData];
            return updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
        });

        setNewMessage('');
    };

    useEffect(() => {
        socket.on('messageAcknowledged', (serverMessage) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.tempId === serverMessage.tempId
                        ? { ...msg, id: serverMessage.id }
                        : msg
                )
            );
        });

        return () => {
            socket.off('messageAcknowledged');
        };
    }, []);

    const handleDeleteMessage = (messageId) => {
        if (!messageId) return;

        socket.emit('deleteMessage', messageId);

        setMessages((prevMessages) => prevMessages.filter((message) => message.id !== messageId && message.tempId !== messageId));
    };



    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };
    const formatDateHeader = (date) => {
        if (!(date instanceof Date)) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    const isNewDay = (currentMessage, previousMessage) => {
        if (!previousMessage) return true;
        return (
            currentMessage.timestamp.toDateString() !== previousMessage.timestamp.toDateString()
        );
    };

    return (
        <div className="friend-chat">
            <div className="chat-header">
                <img src={friendAvatar} className="avatar-image" alt="Friend Avatar" />
                <h2>{friend.username}</h2>
            </div>
            <div className="chat-content">
                <p className="chat-start">
                    This is the beginning of your direct message history with {friend.username}.
                </p>

                {messages.map((msg) => (
                    <React.Fragment key={msg.id || msg.tempId}>
                        {isNewDay(msg, messages[messages.indexOf(msg) - 1]) && (
                            <div className="date-header">{formatDateHeader(msg.timestamp)}</div>
                        )}

                        <div
                            className={`message ${Number(msg.senderId) === Number(userId) ? 'sent' : 'received'}`}
                        >
                            <div className="message-content">
                                <span className="message-username">
                                    {msg.senderId === Number(userId) ? 'You' : msg.senderUsername || 'Unknown'}:
                                </span>
                                <span className="message-text">{msg.content}</span>
                                <span className="message-timestamp">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {msg.senderId === Number(userId) && (
                                    <button
                                        className="trash-icon"
                                        onClick={() => handleDeleteMessage(msg.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        </div>
                    </React.Fragment>
                ))}

                <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Message @${friend.username}`}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default FriendChat;
