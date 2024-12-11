/**
 * 
 * 
 * This component displays a list of friends categorized by their status (All, Online, Pending, Blocked) 
 * and provides functionalities to manage friendships. Users can search for friends, accept/reject 
 * pending requests, block/unblock users, and delete friendships. Notifications for new friend requests 
 * are displayed using `react-toastify`.
 * 
 * Key Functionalities:
 * - Tabs to filter friends by status: All, Online, Pending, and Blocked.
 * - Search functionality to filter displayed friends by name.
 * - Display friend avatars and statuses with actions based on the selected tab.
 * - Toast notifications for new friend requests.
 * 
 * Props:
 * - `onMessageClick`: Callback to initiate a message with a selected friend.
 * - `userId`: The ID of the logged-in user.
 * - `currentUsername`: The username of the logged-in user, used for display in the add friend modal.
 */

import React, { useState, useEffect } from 'react';
import AddFriendModal from '../AddFriendModal/AddFriendModal';
import FriendshipService from '../../Services/FriendshipService';
import './FriendsList.css';
import WumpusPending from '../Assets/pending.png';
import WumpusOnline from '../Assets/online.png';
import WumpusBlocked from '../Assets/blocked.png';
import UserService from '../../Services/UserService';
import defaultAv from '../Assets/default.jpg'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FriendsList = ({ onMessageClick, userId, currentUsername }) => {
    const [selectedTab, setSelectedTab] = useState('All');
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [onlineFriends, setOnlineFriends] = useState([]);
    const [prevPendingCount, setPrevPendingCount] = useState(0);

    useEffect(() => {
        const fetchFriendsData = async () => {
            try {
                const { accepted, pending, blocked } = await FriendshipService.getFriends(userId);

                const acceptedWithAvatars = await Promise.all(
                    accepted.map(async (friend) => {
                        try {
                            const userDetails = await UserService.getUserById(friend.id);
                            return { ...friend, avatar: userDetails.data.user.avatar };
                        } catch (error) {
                            console.error(`Error fetching avatar for friend ID ${friend.id}:`, error);
                            return friend;
                        }
                    })
                );

                const pendingWithAvatars = await Promise.all(
                    pending.map(async (friend) => {
                        try {
                            const userDetails = await UserService.getUserById(friend.id);
                            return { ...friend, avatar: userDetails.data.user.avatar };
                        } catch (error) {
                            console.error(`Error fetching avatar for pending friend ID ${friend.id}:`, error);
                            return friend;
                        }
                    })
                );

                setFriends(acceptedWithAvatars);
                setBlockedUsers(blocked);

                if (pendingWithAvatars.length > prevPendingCount) {
                    const newRequests = pendingWithAvatars.slice(prevPendingCount);
                    newRequests.forEach((request) => {
                        toast.info(`${request.username} added you as a friend!`, {
                            position: 'top-right',
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            icon: '👋',
                        });
                    });
                }

                setPendingRequests(pendingWithAvatars);
                setPrevPendingCount(pendingWithAvatars.length);

                const onlineOnly = acceptedWithAvatars.filter(friend => friend.status === 'Online');
                setOnlineFriends(onlineOnly);
            } catch (error) {
                console.error('Error fetching friends data:', error);
            }
        };

        fetchFriendsData();
    }, [userId, prevPendingCount]);

    const openAddFriendModal = () => setIsAddFriendModalOpen(true);
    const closeAddFriendModal = () => setIsAddFriendModalOpen(false);

    const getFilteredFriends = () => {
        let friendsList = [];
        if (selectedTab === "Online") {
            friendsList = onlineFriends;
        } else if (selectedTab === "Pending") {
            friendsList = pendingRequests;
        } else if (selectedTab === "Blocked") {
            friendsList = blockedUsers;
        } else {
            friendsList = friends;
        }

        if (searchTerm) {
            return friendsList.filter((friend) =>
                friend.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return friendsList;
    };


    const filteredFriends = getFilteredFriends();

    const getNoFriendsMessage = () => {
        switch (selectedTab) {
            case 'Online':
                return "No one's around to play with Wumpus.";
            case 'Pending':
                return 'There are no pending friend requests. Here’s Wumpus for now.';
            case 'Blocked':
                return "You can't unblock the Wumpus.";
            default:
                return "No one's around to play with Wumpus.";
        }
    };

    const getNoFriendsImage = () => {
        switch (selectedTab) {
            case 'Online':
                return WumpusOnline;
            case 'Pending':
                return WumpusPending;
            case 'Blocked':
                return WumpusBlocked;
            default:
                return WumpusOnline;
        }
    };

    const handleAcceptFriend = async (friendId) => {
        try {
            await FriendshipService.acceptFriendRequest(userId, friendId);
            setFriends([...friends, pendingRequests.find(friend => friend.id === friendId)]);
            setPendingRequests(pendingRequests.filter(friend => friend.id !== friendId));
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleRejectFriend = async (friendId) => {
        try {
            await FriendshipService.rejectFriendRequest(userId, friendId);
            setPendingRequests(pendingRequests.filter(friend => friend.id !== friendId));
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        }
    };

    const handleBlockFriend = async (friendId) => {
        try {
            await FriendshipService.blockUser(userId, friendId);

            const userDetails = await UserService.getUserById(friendId);
            const blockedUser = {
                id: friendId,
                username: userDetails.data.user.username,
                avatar: userDetails.data.user.avatar,
                status: "Blocked",
            };

            setBlockedUsers((prev) => [...prev, blockedUser]);
            setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
            setOnlineFriends((prev) => prev.filter((friend) => friend.id !== friendId));
            window.location.reload();
        } catch (error) {
            console.error("Error blocking friend:", error);
        }
    };


    const handleUnblockFriend = async (friendId) => {
        try {
            await FriendshipService.unblockUser(userId, friendId);
            const unblockedUser = blockedUsers.find((friend) => friend.id === friendId);
            if (unblockedUser) {
                const updatedUser = { ...unblockedUser, status: 'Pending' };

                setBlockedUsers((prev) => prev.filter((friend) => friend.id !== friendId));
                setPendingRequests((prev) => [...prev, updatedUser]);
            }
        } catch (error) {
            console.error("Error unblocking friend:", error);
        }
    };


    const handleDeleteFriend = async (friendId) => {
        try {
            await FriendshipService.removeFriend(userId, friendId);
            setFriends(friends.filter(friend => friend.id !== friendId));
            setOnlineFriends(onlineFriends.filter(friend => friend.id !== friendId));
            window.location.reload();
        } catch (error) {
            console.error('Error deleting friend:', error);
        }
    };
    const toggleOptionsMenu = (index) => {
        setOpenMenuIndex(openMenuIndex === index ? null : index);
    };

    return (
        <div className="friends-list">
            <ToastContainer />
            <div className="tabs-wrapper">
                <div className="tabs">
                    {['All', 'Online', 'Pending', 'Blocked'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={selectedTab === tab ? 'tab active' : 'tab'}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <button className="add-friend-btn" onClick={openAddFriendModal}>
                    Add Friend
                </button>
            </div>

            <input
                type="text"
                placeholder="Search"
                className="search-bar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <h3 className="friends-header">
                {selectedTab} FRIENDS — {filteredFriends.length}
            </h3>
            <div className="friends-entries">
                {filteredFriends.length > 0 ? (
                    filteredFriends.map((friend, index) => (
                        <div key={friend.id} className="friend-entry">
                            <div className="friend-avatar">
                                <img
                                    src={friend.avatar ? friend.avatar : defaultAv}
                                    alt={`${friend.username}'s Avatar`}
                                    className="avatar-image"
                                />

                            </div>
                            <div className="friend-info">
                                <span className="friend-username">{friend.username}</span>
                                <span className="friend-status">{friend.status}</span>
                            </div>
                            <div className="friend-actions">
                                {selectedTab === 'Pending' ? (
                                    <>
                                        <button
                                            className="accept-btn"
                                            onClick={() => handleAcceptFriend(friend.id)}
                                        >
                                            ✔
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => handleRejectFriend(friend.id)}
                                        >
                                            ✖
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="options-btn"
                                            onClick={() => toggleOptionsMenu(index)}
                                        >
                                            ⋮
                                        </button>
                                        {openMenuIndex === index && (
                                            <div className="options-menu">
                                                {selectedTab === 'Blocked' ? (
                                                    <button
                                                        onClick={() => handleUnblockFriend(friend.id)}
                                                    >
                                                        Unblock
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBlockFriend(friend.id)}
                                                    >
                                                        Block
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteFriend(friend.id)}
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-friends">
                        <img src={getNoFriendsImage()} alt="No friends found" />
                        <p>{getNoFriendsMessage()}</p>
                    </div>
                )}
            </div>

            {isAddFriendModalOpen && (
                <AddFriendModal
                    onClose={closeAddFriendModal}
                    onAddFriend={(username) => console.log(`Added friend: ${username}`)}
                    userId={userId}
                    currentUsername={currentUsername}
                />
            )}
        </div>
    );
};

export default FriendsList;
