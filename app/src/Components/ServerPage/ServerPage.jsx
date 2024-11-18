/**
 * 
 * 
 * This component represents the main server page, displaying channel messages, handling message
 * sending, and managing server-related modals like inviting people and editing server details.
 * It also uses a WebSocket connection to handle real-time messaging and updates.
 * 
 * Key Functionalities:
 * - Display messages for the current channel.
 * - Send messages and handle message acknowledgments.
 * - Real-time message updates via WebSocket.
 * - Support for inviting people and editing server details through modals.
 * - Auto-navigation to a default channel (e.g., General) if none is selected.
 * 
 * Dependencies:
 * - React Router for navigation between server and channel routes.
 * - WebSocket (socket.io) for real-time messaging.
 * - Service layer (ChannelService, UserService) for API calls.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import './ServerPage.css';
import { FaTrash } from 'react-icons/fa';
import InvitePeopleModal from '../InvitePeopleModal/InvitePeopleModal';
import EditServerModal from '../EditServerModal/EditServerModal';
import ChannelService from '../../Services/ChannelService';
import UserService from '../../Services/UserService';
import socket from '../../Utils/socket';

import defaultAv from '../Assets/default.jpg';
import logo from '../Assets/logo.jpeg';

const ServerPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [highlightInput, setHighlightInput] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditServerModalOpen, setIsEditServerModalOpen] = useState(false);
    const [channelName, setChannelName] = useState('');

    const serverDetails = location.state || {};
    const serverName = serverDetails.name || 'Default Server';
    const serverAvatar = serverDetails.icon || logo;
    const { channelId } = useParams();
    useEffect(() => {
        const fetchChannelName = async () => {
            if (channelId) {
                try {
                    const channel = await ChannelService.getChannelById(channelId);
                    if (channel && channel.name) {
                        setChannelName(channel.name);
                    } else {
                        console.error("Channel name is undefined in returned data:", channel);
                    }
                } catch (error) {
                    console.error("Error fetching channel name:", error);
                }
            }
        };

        fetchChannelName();
    }, [channelId]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (channelId) {
                try {
                    const fetchedMessages = await ChannelService.getMessagesByChannel(channelId);
                    setMessages(fetchedMessages);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        };

        fetchMessages();
    }, [channelId]);
    useEffect(() => {
        if (channelId) {
            socket.emit('joinChannel', `channel-${channelId}`);

            return () => {
                socket.emit('leaveChannel', `channel-${channelId}`);
            };
        }
    }, [channelId]);
    useEffect(() => {
        socket.on('receiveMessage', async (message) => {
            if (!message.Sender?.username || !message.Sender?.avatar) {
                try {
                    const userResponse = await UserService.getUserById(message.sender_id);
                    message.Sender = {
                        username: userResponse.data.user.username,
                        avatar: userResponse.data.user.avatar || defaultAv,
                    };
                } catch (error) {
                    console.error('Error fetching sender details:', error);
                    message.Sender = { username: 'Unknown', avatar: defaultAv };
                }
            }

            setMessages((prevMessages) => {
                const isDuplicate = prevMessages.some((msg) => msg.id === message.id);
                if (isDuplicate) return prevMessages;

                const updatedMessages = [...prevMessages, message];
                return updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            });
        });

        socket.on('messageAcknowledged', async (serverMessage) => {
            if (!serverMessage.Sender?.username || !serverMessage.Sender?.avatar) {
                try {
                    const userResponse = await UserService.getUserById(serverMessage.sender_id);
                    serverMessage.Sender = {
                        username: userResponse.data.user.username,
                        avatar: userResponse.data.user.avatar || defaultAv,
                    };
                } catch (error) {
                    console.error('Error fetching sender details:', error);
                    serverMessage.Sender = { username: 'Unknown', avatar: defaultAv };
                }
            }

            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.tempId === serverMessage.tempId
                        ? {
                            ...msg,
                            id: serverMessage.id,
                            Sender: serverMessage.Sender,
                            sender_id: serverMessage.sender_id,
                        }
                        : msg
                )
            );
        });


        socket.on('messageDeleted', (messageId) => {
            setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
        });

        return () => {
            socket.off('receiveMessage');
            socket.off('messageAcknowledged');
            socket.off('messageDeleted');
        };
    }, []);

    const handleSendMessage = () => {
        if (inputValue.trim() === '') return;

        const tempId = `temp-${Date.now()}`;
        const messageData = {
            content: inputValue,
            senderId: Number(localStorage.getItem('userId')),
            channelId,
            timestamp: new Date(),
            tempId,
        };

        socket.emit('sendMessage', messageData);

        setMessages((prevMessages) => [...prevMessages, messageData]);
        setInputValue('');

    };

    useEffect(() => {
        if (!channelId && serverDetails.channels) {
            const generalChannel = serverDetails.channels.find((ch) => ch.name === 'General');
            if (generalChannel) {
                navigate(`/server/${serverDetails.id}/channel/${generalChannel.id}`);
            }
        }
    }, [channelId, navigate, serverDetails]);

    const handleDeleteMessage = (messageId) => {
        if (!messageId) return;

        socket.emit('deleteMessage', messageId);

        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
    };


    const handleFirstMessageClick = () => {
        if (messages.length === 0) {
            setHighlightInput(true);
        }
    };


    useEffect(() => {
        const fetchMessages = async () => {
            if (channelId) {
                try {
                    const fetchedMessages = await ChannelService.getMessagesByChannel(channelId);
                    const enrichedMessages = await Promise.all(
                        fetchedMessages.map(async (msg) => {
                            if (!msg.Sender?.username || !msg.Sender?.avatar) {
                                try {
                                    const userResponse = await UserService.getUserById(msg.sender_id);
                                    return {
                                        ...msg,
                                        Sender: {
                                            username: userResponse.data.user.username,
                                            avatar: userResponse.data.user.avatar || defaultAv,
                                        },
                                    };
                                } catch (error) {
                                    console.error('Error fetching sender details:', error);
                                    return {
                                        ...msg,
                                        Sender: { username: 'Unknown', avatar: defaultAv },
                                    };
                                }
                            }
                            return msg;
                        })
                    );
                    setMessages(enrichedMessages);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        };

        fetchMessages();

        return () => {
            setMessages([]);
        };
    }, [channelId]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const closeInviteModal = () => setIsInviteModalOpen(false);

    const closeEditServerModal = () => setIsEditServerModalOpen(false);

    const handleSaveServerChanges = ({ name, image }) => {
        setIsEditServerModalOpen(false);
    };

    return (
        <div className="server-content">
            <div className="welcome-section">
                <h1>Welcome to {channelName}</h1>
                <p>
                    This is your brand new, shiny server. Here are some steps to help you get started. For more, check out our{' '}
                    <a
                        href="https://support.discord.com/hc/en-us/articles/360045138571-Beginner-s-Guide-to-Discord?utm_campaign=2020-06_help-new-user&utm_content=--t%3Apm&utm_medium=blog&utm_source=discord"
                    >
                        Getting Started guide
                    </a>.
                </p>

            </div>

            {/* Chat Section */}
            <div className="chat-section">
                <div className="chat-section">
                    <div className="chat-section">
                        {messages.map((msg, index) => (
                            <div key={msg.id || index} className="message">
                                <div className="message-info">
                                    <img
                                        src={msg.Sender?.avatar || defaultAv}
                                        alt="Avatar"
                                        className="avatar"
                                    />
                                    <div>
                                        <span className="author">{msg.Sender?.username || 'Unknown'}</span>
                                        <span className="date">{new Date(msg.timestamp).toLocaleString()}</span>
                                        <p className="content">{msg.content}</p>
                                    </div>
                                </div>
                                <div className="message-options">
                                    {Number(localStorage.getItem('userId')) === msg.sender_id && (
                                        <FaTrash className="icon" onClick={() => handleDeleteMessage(msg.id)} />
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>

                </div>


            </div>
            <div className={`message-input-container ${highlightInput ? 'highlight' : ''}`}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message #${channelName || 'general'}`}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
            <InvitePeopleModal isOpen={isInviteModalOpen} onClose={closeInviteModal} />
            <EditServerModal
                isOpen={isEditServerModalOpen}
                onClose={closeEditServerModal}
                onSave={handleSaveServerChanges}
                initialName={serverName}
                initialImage={serverAvatar}
            />
        </div>
    );
};

export default ServerPage;
