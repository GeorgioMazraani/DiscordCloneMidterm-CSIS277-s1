/**
 * 
 * 
 * This component provides a modal interface for creating a direct message (DM) session with a selected friend. 
 * It allows users to search for friends, select a friend, and initiate a DM session using backend services.
 * 
 * Key Functionalities:
 * - Fetches the list of friends with their avatars.
 * - Filters friends based on a search term.
 * - Allows users to select a friend and initiate a DM session.
 * - Displays loading and error states during the data fetching process.
 * 
 * Props:
 * - `onClose`: Callback function to close the modal.
 * - `onCreateDM`: Callback function triggered after successfully creating or retrieving a DM session.
 * - `userId`: ID of the logged-in user, used to fetch their friends.
 */

import React, { useState, useEffect } from 'react';
import FriendshipService from '../../Services/FriendshipService';
import UserService from '../../Services/UserService';
import DirectMessageService from '../../Services/DirectMessageService';
import './CreateDMModal.css';
import defaultAv from '../Assets/default.jpg';

const CreateDMModal = ({ onClose, onCreateDM, userId }) => {
    const [friends, setFriends] = useState([]);
    const [selectedFriendId, setSelectedFriendId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await FriendshipService.getFriends(userId);
                const friendsList = data.accepted;

                const friendsWithAvatars = await Promise.all(
                    friendsList.map(async (friend) => {
                        try {
                            const userDetails = await UserService.getUserById(friend.id);
                            return { ...friend, avatar: userDetails.data.user.avatar };
                        } catch (error) {
                            console.error(`Error fetching avatar for friend ${friend.username}:`, error);
                            return friend;
                        }
                    })
                );

                setFriends(friendsWithAvatars);
            } catch (err) {
                setError('Failed to load friends.');
                console.error('Error fetching friends:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [userId]);

    const handleSelectFriend = (id) => {
        setSelectedFriendId(id);
    };

    const handleCreateDMClick = async () => {
        const selectedFriend = friends.find((friend) => friend.id === selectedFriendId);
        if (selectedFriend) {
            try {
                const response = await DirectMessageService.createOrGetDirectMessage(userId, selectedFriend.id);
                const directMessage = response.data;
                onCreateDM(directMessage);
                onClose();
                window.location.reload();
            } catch (error) {
                console.error("Error creating or retrieving DM session:", error);
                setError("Failed to create or retrieve DM session.");
            }
        }
    };

    const filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Select Friend</h2>
                <input
                    type="text"
                    placeholder="Search by username"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {loading ? (
                    <p>Loading friends...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    <div className="friend-list">
                        {filteredFriends.map((friend) => (
                            <div
                                key={friend.id}
                                className={`friend-item ${selectedFriendId === friend.id ? 'selected' : ''}`}
                                onClick={() => handleSelectFriend(friend.id)}
                            >
                                <div className="friend-avatar">
                                    <img
                                        src={friend.avatar || defaultAv}
                                        alt={`${friend.username}'s Avatar`}
                                        className="avatar-image"
                                    />
                                </div>
                                <span className="friend-name">{friend.username}</span>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    className="create-dm-btn"
                    onClick={handleCreateDMClick}
                    disabled={!selectedFriendId}
                >
                    Create DM
                </button>
                <button className="close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default CreateDMModal;
