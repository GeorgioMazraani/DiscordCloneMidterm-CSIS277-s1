/**
 * 
 * 
 * This component serves as the main sidebar for the application, providing navigation between servers, channels, and direct messages (DMs). 
 * It includes functionality for server and channel management, creating direct messages, and interacting with voice channels.
 * 
 * Key Functionalities:
 * - Displays a list of servers with options to create, edit, or delete servers.
 * - Displays text and voice channels within the selected server, with options to create or delete channels.
 * - Allows navigation to specific channels and direct messages.
 * - Provides modals for server and channel creation, inviting people, and editing server details.
 * - Includes a user profile section for accessing settings and managing user status.
 * 
 * Props:
 * - `onFriendClick`: Callback function triggered when a direct message is selected.
 * - `onShowFriendsList`: Callback function triggered when the "Friends" button is clicked.
 * - `onSettingsClick`: Callback function triggered to open the settings modal.
 * - `userId`: The ID of the logged-in user, used for fetching data and managing interactions.
 */


import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './SideBar.css';
import { FaChevronDown, FaPlus, FaUserPlus, FaPen, FaMicrophoneSlash, FaHeadphonesAlt, FaSignOutAlt } from 'react-icons/fa';
import { FaEllipsisV } from 'react-icons/fa';

import UserProfile from '../UserProfile/UserProfile';
import logo from '../Assets/logo.jpeg';
import ServerModal from '../ServerModal/ServerModal';
import CreateChannelModal from '../CreateChannelModal/CreateChannelModal';
import InvitePeopleModal from '../InvitePeopleModal/InvitePeopleModal';
import EditServerModal from '../EditServerModal/EditServerModal';
import CreateDMModal from '../CreateDMModal/CreateDMModal';
import DirectMessageService from '../../Services/DirectMessageService';
import ServerService from '../../Services/ServerService';
import ChannelService from '../../Services/ChannelService';

import { Buffer } from 'buffer';


const SideBar = ({ onFriendClick, onShowFriendsList, onSettingsClick, userId }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isServerPage = location.pathname.startsWith("/server");

    const [isServerModalOpen, setIsServerModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [servers, setServers] = useState([]);
    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditServerModalOpen, setIsEditServerModalOpen] = useState(false);
    const [inVoiceChannel, setInVoiceChannel] = useState(false);
    const [isCreateDMModalOpen, setIsCreateDMModalOpen] = useState(false);
    const [directMessages, setDirectMessages] = useState([]);
    const [channels, setChannels] = useState([]);
    const [textChannels, setTextChannels] = useState([]);
    const [voiceChannels, setVoiceChannels] = useState([]);
    const [currentServerId, setCurrentServerId] = useState(null);
    const [currentServerName, setCurrentServerName] = useState('');
    const [currentServerImage, setCurrentServerImage] = useState('');
    const [openChannelMenu, setOpenChannelMenu] = useState(null);

    const toggleChannelMenu = (channelId) => {
        setOpenChannelMenu((prev) => (prev === channelId ? null : channelId));
    };

    const fetchDirectMessages = async () => {
        try {
            const response = await DirectMessageService.getDirectMessagesByUser(userId);
            const validDMs = response.data.filter((dm) => dm.User1 && dm.User2);
            setDirectMessages(validDMs);
        } catch (error) {
            console.error('Error fetching direct messages:', error);
        }
    };

    useEffect(() => {
        fetchDirectMessages();
    }, [userId]);
    useEffect(() => {
        localStorage.setItem('directMessages', JSON.stringify(directMessages));
    }, [directMessages]);

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await ServerService.getAllServers();
                const userId = localStorage.getItem("userId");
                const userServers = response.servers.filter(server =>
                    server.owner_id === parseInt(userId) || server.Members.some(member => member.id === parseInt(userId))
                );
                setServers(userServers);
            } catch (error) {
                console.error("Error fetching servers:", error);
            }
        };

        fetchServers();
    }, []);

    const handleChannelCreated = (newChannel) => {
        setChannels((prevChannels) => [...prevChannels, newChannel]);
        if (newChannel.type === "text") {
            setTextChannels((prev) => [...prev, newChannel]);
        } else if (newChannel.type === "voice") {
            setVoiceChannels((prev) => [...prev, newChannel]);
        }
    };
    const handleChannelClick = (channelId) => {
        console.log('Navigating to channelId:', channelId);
        navigate(`/server/${currentServerId}/channel/${channelId}`);
    };


    const handleLogoClick = () => navigate("/");

    const handleAddServerClick = () => setIsServerModalOpen(true);
    const handleCloseServerModal = () => setIsServerModalOpen(false);

    const handleServerCreated = (newServer) => {
        setServers((prevServers) => [...prevServers, newServer]);
        setIsServerModalOpen(false);
        window.location.reload();
    };
    const handleServerClick = async (serverId) => {
        try {
            localStorage.setItem("currentServerId", serverId);

            setCurrentServerId(serverId);
            setIsDropdownOpen(false);

            const server = await ServerService.getServerById(serverId);

            setCurrentServerName(server.server.name);
            setChannels([]);
            setTextChannels([]);
            setVoiceChannels([]);

            navigate(`/server/${serverId}`, {
                state: {
                    id: server.server.id,
                    name: server.server.name,
                    icon: server.server.icon,
                    ownerId: server.server.owner_id,
                },
            });

            fetchChannels(serverId);
        } catch (error) {
            console.error("Error fetching server details:", error);
        }
    };

    const fetchChannels = async (serverId) => {
        try {
            const response = await ChannelService.getChannelsByServer(serverId);
            console.log('Fetched Channels:', response); // Log the response
            setChannels(response);
            setTextChannels(response.filter(channel => channel.type === 'text'));
            setVoiceChannels(response.filter(channel => channel.type === 'voice'));
        } catch (error) {
            console.error('Error fetching channels:', error);
        }
    };

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleInvitePeopleClick = () => {
        setIsInviteModalOpen(true);
        setIsDropdownOpen(false);
    };

    const handleEditServerClick = (server) => {
        setCurrentServerId(server.id);
        setCurrentServerName(server.name);
        setCurrentServerImage(
            server.icon
                ? `data:image/jpeg;base64,${Buffer.from(server.icon).toString('base64')}`
                : '/default-avatar.png'
        );
        setIsEditServerModalOpen(true);
    };
    const handleDeleteChannel = async (channelId) => {
        try {
            await ChannelService.deleteChannel(channelId);
            console.log(`Deleted channel with ID: ${channelId}`);

            setTextChannels((prev) => prev.filter((channel) => channel.id !== channelId));
            setChannels((prev) => prev.filter((channel) => channel.id !== channelId));
        } catch (error) {
            console.error(`Failed to delete channel: ${error.message}`);
        }
    };

    const handleCreateChannelClick = () => {
        setIsCreateChannelModalOpen(true);
        setIsDropdownOpen(false);
    };

    const closeInviteModal = () => setIsInviteModalOpen(false);
    const closeCreateChannelModal = () => setIsCreateChannelModalOpen(false);
    const closeEditServerModal = () => setIsEditServerModalOpen(false);

    const handleSaveServerChanges = (updatedServer) => {
        if (!updatedServer) {
            setServers((prevServers) => prevServers.filter((server) => server.id !== currentServerId));
        } else {
            setServers((prevServers) =>
                prevServers.map((server) =>
                    server.id === updatedServer.id ? updatedServer : server
                )
            );
        }
    };


    const handleVoiceChannelClick = () => {
        setInVoiceChannel(!inVoiceChannel);
    };

    const handleFriendsClick = () => {
        onShowFriendsList();
        navigate("/");
    };

    const handleDirectMessageClick = (directMessage) => {
        onFriendClick(directMessage);
        navigate(`/chat/${directMessage.id}`);
    };

    const handleCreateDMClick = () => {
        setIsCreateDMModalOpen(true);
    };

    useEffect(() => {
        const storedDMs = JSON.parse(localStorage.getItem('directMessages')) || [];
        const validDMs = storedDMs.filter(dm => dm.User1 && dm.User2);

        setDirectMessages(validDMs);
    }, []);



    const handleAddDirectMessage = async (friend) => {
        try {
            const response = await DirectMessageService.createOrGetDirectMessage(userId, friend.id);
            const directMessage = response.data;

            const dmExists = directMessages.some(dm => dm.id === directMessage.id);
            if (!dmExists) {
                setDirectMessages([...directMessages, directMessage]);
            }

            onFriendClick(friend);
            setIsCreateDMModalOpen(false);
            navigate(`/chat/${directMessage.id}`);
        } catch (error) {
            console.error("Error creating or retrieving DM:", error);
        }
    };

    return (
        <div className="sidebar">
            <div className="server-column">
                <div className="server-icon" onClick={handleLogoClick}>
                    <img src={logo} alt="Logo" className="discord-logo" />
                </div>

                {servers.map((server) => {
                    const iconSrc = server.icon
                        ? `data:image/jpeg;base64,${Buffer.from(server.icon).toString('base64')}`
                        : '/default-avatar.png';

                    return (
                        <div key={server.id} className="server-wrapper" onClick={() => handleServerClick(server.id)}>
                            <Link to={`/server/${server.id}`} className="server-icon-wrapper">
                                <div className="server-icon server-icon--custom">
                                    <img src={iconSrc} alt={server.name} className="server-image" />
                                </div>
                                <span className="tooltip">{server.name}</span>
                            </Link>

                        </div>
                    );
                })}





                <div className="server-icon" onClick={handleAddServerClick}>+</div>
            </div>

            <div className="content-column">
                {isServerPage ? (
                    <>
                        <div
                            className="server-name"
                            onClick={servers.some(server => server.owner_id === parseInt(userId)) ? toggleDropdown : null}
                        >
                            <span>{currentServerName} Server</span>
                            {servers.some(server => server.owner_id === parseInt(userId)) && (
                                <FaChevronDown className="dropdown-arrow" />
                            )}
                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    {servers
                                        .filter(server => server.id === currentServerId && server.owner_id === parseInt(userId))
                                        .map(server => (
                                            <button
                                                key={server.id}
                                                onClick={() => handleEditServerClick(server)}
                                            >
                                                <FaPen className="menu-icon" /> Edit Server
                                            </button>
                                        ))}
                                    <button onClick={handleInvitePeopleClick}>
                                        <FaUserPlus className="menu-icon" /> Invite People
                                    </button>
                                    <button onClick={handleCreateChannelClick}>
                                        <FaPlus className="menu-icon" /> Create Channel
                                    </button>
                                </div>
                            )}

                        </div>

                        <div className="nav-items">
                            <div className="channel-header">
                                <h3>TEXT CHANNELS</h3>
                                {servers.some(server => server.owner_id === parseInt(userId)) && (
                                    <div className="add-channel-icon" title="Create Text Channel" onClick={handleCreateChannelClick}>
                                        <FaPlus />
                                    </div>
                                )}
                            </div>

                            {textChannels.map((channel) => (
                                <div key={channel.id} className="channel-item">
                                    <button className="nav-item" onClick={() => handleChannelClick(channel.id)}>
                                        # {channel.name}
                                    </button>
                                    <FaEllipsisV className="menu-icon" onClick={() => toggleChannelMenu(channel.id)} />
                                    {openChannelMenu === channel.id && (
                                        <div className="channel-menu">
                                            <button onClick={() => handleDeleteChannel(channel.id)}>Delete</button>
                                        </div>
                                    )}
                                </div>
                            ))}


                        </div>

                        <div className="nav-items">
                            <div className="channel-header">
                                <h3>VOICE CHANNELS</h3>
                                {servers.some(server => server.owner_id === parseInt(userId)) && (
                                    <div className="add-channel-icon" title="Create Voice Channel" onClick={handleCreateChannelClick}>
                                        <FaPlus />
                                    </div>
                                )}
                            </div>
                            {voiceChannels.map((channel) => (
                                <button
                                    key={channel.id}
                                    className="nav-item"
                                    onClick={() => handleChannelClick(channel.id)}>
                                    🔊 {channel.name}
                                </button>
                            ))}

                        </div>


                        {inVoiceChannel && (
                            <div className="voice-channel-status">
                                <div className="voice-channel-info">
                                    <span>Voice Connected</span>
                                    <span>General / {servers[0]?.name || "Server"}</span>
                                </div>
                                <div className="voice-channel-controls">
                                    <FaMicrophoneSlash className="icon" title="Mic Muted" />
                                    <FaHeadphonesAlt className="icon" title="Headset Muted" />
                                    <FaSignOutAlt className="icon disconnect-icon" onClick={handleVoiceChannelClick} title="Disconnect" />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="nav-items">
                            <button className="nav-item enhanced-nav-item" onClick={handleFriendsClick}>
                                Friends
                            </button>
                        </div>
                        <div className="direct-messages">
                            <h3>DIRECT MESSAGES</h3>
                            <button className="add-friend" onClick={handleCreateDMClick}>+</button>
                            {directMessages
                                .filter(dm => dm.User1 && dm.User2)
                                .map((dm) => {
                                    const friend = dm.User1.id === Number(userId) ? dm.User2 : dm.User1;

                                    const avatarBase64 = friend.avatar && friend.avatar.data
                                        ? `data:image/jpeg;base64,${Buffer.from(friend.avatar.data).toString('base64')}`
                                        : '/default-avatar.png';

                                    return (
                                        <div key={dm.id} className="dm-entry">
                                            <div className="dm-info" onClick={() => handleDirectMessageClick(dm)}>
                                                <div className="dm-avatar">
                                                    <img
                                                        src={avatarBase64}
                                                        className="avatar-image"
                                                        alt={`${friend.username}'s Avatar`}
                                                    />
                                                </div>
                                                <span className="dm-username">{friend.username}</span>
                                            </div>
                                        </div>
                                    );
                                })}



                        </div>
                    </>
                )}

                <UserProfile userId={userId} onSettingsClick={onSettingsClick} />
            </div>

            {isServerModalOpen && (
                <ServerModal
                    onClose={handleCloseServerModal}
                    onServerCreated={handleServerCreated}
                />
            )}
            {isCreateChannelModalOpen && (
                <CreateChannelModal
                    isOpen={isCreateChannelModalOpen}
                    onClose={closeCreateChannelModal}
                    serverId={localStorage.getItem("currentServerId")}
                    onChannelCreated={handleChannelCreated}
                />

            )}
            {isInviteModalOpen && (
                <InvitePeopleModal
                    isOpen={isInviteModalOpen}
                    onClose={closeInviteModal}
                    serverId={currentServerId}
                    inviterId={userId}
                />
            )}

            {isEditServerModalOpen && (
                <EditServerModal
                    isOpen={isEditServerModalOpen}
                    onClose={closeEditServerModal}
                    onSave={handleSaveServerChanges}
                    serverId={currentServerId}
                    initialName={currentServerName}
                    initialImage={currentServerImage}
                />
            )}


            {isCreateDMModalOpen && (
                <CreateDMModal
                    isOpen={isCreateDMModalOpen}
                    onClose={() => setIsCreateDMModalOpen(false)}
                    onCreateDM={handleAddDirectMessage}
                    userId={userId}
                />
            )}
        </div>
    );
};

export default SideBar;
