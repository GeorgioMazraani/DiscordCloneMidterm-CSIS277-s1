/**
 * 
 * 
 * This component provides a modal interface for adding friends by their username. 
 * It handles friend requests, validates usernames, checks the friendship status, 
 * and displays errors or success messages accordingly.
 * 
 * Key Functionalities:
 * - Input a username to send a friend request.
 * - Validate the entered username and check the friendship status.
 * - Display appropriate error messages (e.g., user not found, already a friend).
 * - Show a success toast notification when a friend request is successfully sent.
 * 
 * Props:
 * - `onClose`: Callback function to close the modal.
 * - `onAddFriend`: Callback function triggered after successfully sending a friend request.
 * - `userId`: ID of the logged-in user, used to fetch and manage friendships.
 * - `currentUsername`: Username of the logged-in user to prevent self-adding.
 */

import React, { useState, useEffect } from 'react';
import './AddFriendModal.css';
import FriendshipService from '../../Services/FriendshipService';
import UserService from '../../Services/UserService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const AddFriendModal = ({ onClose, onAddFriend, userId, currentUsername }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const [friendsList, setFriendsList] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await FriendshipService.getFriends(userId);
                setFriendsList(response.data || []);
            } catch (error) {
                console.error("Error fetching friends list:", error);
            }
        };

        fetchFriends();
    }, [userId]);

    const handleAddFriend = async () => {
        setError(null);

        try {
            const friendResponse = await UserService.getUserByUsername(username);
            const friendId = friendResponse.data?.user?.id || friendResponse.data?.id;

            if (friendId == userId) {
                setError("You cannot add yourself as a friend.");
                return;
            }

            const statusResponse = await FriendshipService.areFriends(userId, friendId);
            const friendshipStatus = statusResponse.data;

            if (friendshipStatus === 'accepted') {
                setError("This user is already your friend.");
                return;
            } else if (friendshipStatus === 'pending') {
                setError("A friend request is already pending with this user.");
                return;
            } else if (friendshipStatus === 'blocked') {
                setError("You have blocked this user.");
                return;
            }

            await FriendshipService.addFriend(userId, friendId);

            // Show success toast
            toast.success(`Friend request sent to ${username}!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            onAddFriend(username);
            setUsername('');
            onClose();

        } catch (error) {
            if (error.response?.status === 500) {
                setError("Already added this user");
            } else if (error.response?.status === 404) {
                setError("User not found.");
            } else {
                setError("Failed to send friend request. Please try again.");
            }
        }
    };


    return (
        <div className="add-friend-modal">
            <div className="modal-content">
                <h2>Add Friend</h2>
                <input
                    type="text"
                    placeholder="You can add friends with their Discord username."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="username-input"
                />
                {error && <p className="error-message">{error}</p>}
                <div className="modal-actions">
                    <button className="send-request-btn" onClick={handleAddFriend}>
                        Send Friend Request
                    </button>
                    <button className="close-btn" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddFriendModal;
