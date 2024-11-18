/**
 * InvitePeopleModal.js
 * 
 * This component provides a modal interface for inviting friends to a server. It allows users to
 * search for friends, invite them via direct invite functionality, and share an invite link. 
 * The modal fetches and displays the user's friends and supports editing the invite link.
 * 
 * Key Functionalities:
 * - Fetch and display the user's list of friends with details.
 * - Filter friends using a search bar.
 * - Invite friends to the server via a direct button.
 * - Share and edit an invite link for the server.
 * 
 * Props:
 * - `isOpen`: Boolean to control the visibility of the modal.
 * - `onClose`: Callback function to close the modal.
 * - `serverId`: ID of the server to which friends are being invited.
 * - `inviterId`: ID of the user sending the invite.
 */

import React, { useState, useEffect } from 'react';
import './InvitePeopleModal.css';
import { FaTimes, FaSearch } from 'react-icons/fa';
import FriendshipService from '../../Services/FriendshipService';
import ServerService from '../../Services/ServerService';
import UserService from '../../Services/UserService';
import defaultAv from '../Assets/default.jpg';

const InvitePeopleModal = ({ isOpen, onClose, serverId, inviterId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [inviteLink, setInviteLink] = useState('https://discord.gg/DDXwrrWx');
    const [isCopied, setIsCopied] = useState(false);
    const [friends, setFriends] = useState([]);
    const [friendsWithDetails, setFriendsWithDetails] = useState([]);
    const [invitedFriends, setInvitedFriends] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                if (isOpen) {
                    const response = await FriendshipService.getFriends(inviterId);
                    const friendsList = response.accepted || [];
                    setFriends(friendsList);
                }
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };

        fetchFriends();
    }, [isOpen, inviterId]);

    useEffect(() => {
        const fetchFriendDetails = async () => {
            const updatedFriends = await Promise.all(
                friends.map(async (friend) => {
                    try {
                        const userResponse = await UserService.getUserById(friend.id);
                        return { ...friend, avatar: userResponse.data.user.avatar };
                    } catch (error) {
                        console.error(`Error fetching user details for friend ID: ${friend.id}`, error);
                        return friend;
                    }
                })
            );
            setFriendsWithDetails(updatedFriends);
        };

        if (friends.length > 0) {
            fetchFriendDetails();
        }
    }, [friends]);

    const filteredFriends = friendsWithDetails.filter((friend) => {
        return (
            friend.username &&
            (searchTerm === '' || friend.username.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    const handleInviteClick = async (friendId) => {
        try {
            await ServerService.addUserToServer(serverId, inviterId, friendId);
            setInvitedFriends((prev) => [...prev, friendId]);
        } catch (error) {
            console.error('Error inviting friend:', error);
            alert('Failed to invite friend. Please try again.');
        }
    };

    const handleCopyClick = () => {
        navigator.clipboard.writeText(inviteLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleEditLinkClick = () => {
        const newLink = prompt('Edit your invite link:', inviteLink);
        if (newLink) setInviteLink(newLink);
    };

    return isOpen ? (
        <div className="invite-modal-overlay">
            <div className="invite-modal">
                <div className="invite-modal-header">
                    <h2>Invite friends to your server</h2>
                    <FaTimes className="close-icon" onClick={onClose} />
                </div>

                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search for friends"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="friend-list">
                    {filteredFriends.length > 0 ? (
                        filteredFriends.map((friend) => (
                            <div key={friend.id} className="friend-item">
                                <img
                                    src={friend.avatar || defaultAv}
                                    alt={friend.username || 'Unknown'}
                                    className="friend-avatar"
                                />
                                <span className="friend-name">{friend.username || 'Unknown'}</span>
                                <button
                                    className="invite-button"
                                    onClick={() => handleInviteClick(friend.id)}
                                    disabled={invitedFriends.includes(friend.id)}
                                >
                                    {invitedFriends.includes(friend.id) ? 'Invited' : 'Invite'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No friends available to invite.</p>
                    )}
                </div>

                <div className="invite-link-section">
                    <p>OR, SEND A SERVER INVITE LINK TO A FRIEND</p>
                    <div className="invite-link-container">
                        <span className="invite-link">{inviteLink}</span>
                        <button className="copy-button" onClick={handleCopyClick}>
                            {isCopied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <p className="invite-expiration">
                        Your invite link expires in 7 days.{' '}
                        <button onClick={handleEditLinkClick} className="edit-link-button">
                            Edit invite link
                        </button>
                        .
                    </p>
                </div>
            </div>
        </div>
    ) : null;
};

export default InvitePeopleModal;
