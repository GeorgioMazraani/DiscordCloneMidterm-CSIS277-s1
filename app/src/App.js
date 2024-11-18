/**
 * App.js
 * 
 * This file serves as the main component for the React application. It defines the overall 
 * structure, routing, and state management for key features like user authentication, sidebar 
 * navigation, direct messages, settings, and modals. It also listens for real-time events via 
 * sockets and handles session expiration logic. The component ensures smooth transitions 
 * between pages like login, chat, and server channels while maintaining state consistency.
 * 
 * Key Functionalities:
 * - User Authentication: Login, logout, and session handling.
 * - Sidebar Navigation: Displays direct messages, friends list, and settings.
 * - Real-time Notifications: Plays a sound for new direct messages using sockets.
 * - Routing: Manages navigation between login, chat, settings, and server pages.
 * - Modals: Handles modals for creating DMs and accessing settings.
 * 
 * Components Used:
 * - SideBar: For navigation and user interactions.
 * - FriendsList: Displays the user's friends and their statuses.
 * - FriendChat: Chat interface for direct messages.
 * - CreateDMModal: Modal for creating new direct message threads.
 * - SettingsPage: User settings and logout options.
 * - ServerPage: Placeholder for server-specific channels and content.
 */
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import SideBar from './Components/Sidebar/SideBar';
import FriendsList from './Components/FriendsList/FriendsList';
import FriendChat from './Components/FriendChat/FriendChat';
import CreateDMModal from './Components/CreateDMModal/CreateDMModal';
import SettingsPage from './Components/SettingPage/SettingPage';
import ServerPage from './Components/ServerPage/ServerPage';
import LoginRegister from './Components/LoginRegister/LoginRegister';
import UserService from './Services/UserService';
import { setOnSessionExpired } from './http-common';
import messageSound from './Components/Assets/sounds/message.mp3';
import socket from './Utils/socket';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [currentUsername, setCurrentUsername] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [directMessages, setDirectMessages] = useState([]);
  const [showFriendsList, setShowFriendsList] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const notificationSound = new Audio(messageSound);

    const handleReceiveNotification = (message) => {
      const dmId = message.dm_id || message.dmId;
      const currentPath = location.pathname;
      const dmPath = `/chat/${dmId}`;
      if (!dmId) {
        console.log("Notification ignored due to missing dmId.");
        return;
      }
      console.log(`Current Path: ${currentPath}, DM Path: ${dmPath}, DM ID: ${dmId}`);

      // Play sound if the user is NOT in the chat of the incoming DM
      if (currentPath !== dmPath) {
        notificationSound.play().catch((error) => {
          console.error('Error playing notification sound:', error);
        });
      } else {
        console.log('User is already in the chat, no notification sound played.');
      }
    };

    socket.on('receiveNotification', handleReceiveNotification);

    return () => {
      socket.off('receiveNotification', handleReceiveNotification);
    };
  }, [location.pathname]);


  useEffect(() => {
    setOnSessionExpired(() => setSessionExpired(true));

    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (token && storedUserId) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
      localStorage.setItem("isAuthenticated", "true");

      UserService.getUserById(storedUserId)
        .then(response => {
          setCurrentUsername(response.data.username);
        })
        .catch(error => {
          console.error("Error fetching user details:", error);
        });
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUserId(userData.id);
    setCurrentUsername(userData.username);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userId", userData.id);
    localStorage.setItem("token", userData.token);
    navigate('/@me');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    setCurrentUsername('');
    setIsSettingsOpen(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  const closeSessionExpiredPopup = () => {
    setSessionExpired(false);
    handleLogout();
  };

  const handleFriendClick = (dm) => {
    console.log("DM object:", dm);
    console.log("Current userId:", userId);

    const numericUserId = Number(userId);

    const friend = dm.User1.id === numericUserId ? dm.User2 : dm.User1;

    console.log("Selected friend object:", friend);

    setSelectedFriend({ ...friend, dmId: dm.id });
    setShowFriendsList(false);
    navigate(`/chat/${dm.id}`);
  };


  const handleAddDirectMessage = (friend) => {
    if (!directMessages.some(dm => dm.id === friend.id)) {
      setDirectMessages([...directMessages, friend]);
    }
    handleFriendClick(friend);
  };

  const handleDeleteDM = (id) => {
    setDirectMessages(directMessages.filter((dm) => dm.id !== id));

    if (selectedFriend?.id === id) {
      setSelectedFriend(null);
      setShowFriendsList(true);
      navigate('/@me');
    }
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const backgroundClass = isAuthPage ? 'login-background' : 'main-app';

  return (
    <div className={`app-container ${backgroundClass}`} key={isAuthenticated}>
      {sessionExpired && (
        <div className="session-expired-popup">
          <div className="popup-content">
            <p>Session expired. Please log in again.</p>
            <button onClick={closeSessionExpiredPopup}>OK</button>
          </div>
        </div>
      )}
      {isAuthenticated && !isAuthPage && (
        <SideBar
          userId={userId}
          onFriendClick={handleFriendClick}
          onAddClick={() => setIsModalOpen(true)}
          directMessages={directMessages}
          onShowFriendsList={() => setShowFriendsList(true)}
          onDeleteDM={handleDeleteDM}
          onSettingsClick={handleSettingsClick}
          showContentColumn={true}
          onLogout={handleLogout}
        />
      )}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<LoginRegister onLogin={handleLogin} />} />
          <Route path="/register" element={<LoginRegister onLogin={handleLogin} />} />
          <Route
            path="/@me"
            element={
              isAuthenticated ? (
                showFriendsList ? (
                  <FriendsList onMessageClick={handleAddDirectMessage} userId={userId} currentUsername={currentUsername} />
                ) : (
                  <FriendChat friend={selectedFriend} userId={userId} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/server/:serverId/channel/:channelId"
            element={isAuthenticated ? <ServerPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/chat/:dmId"
            element={
              isAuthenticated ? (
                selectedFriend ? (
                  <FriendChat friend={selectedFriend} userId={userId} dmId={selectedFriend.dmId} />
                ) : (
                  <Navigate to="/@me" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/" element={<Navigate to="/@me" />} />
        </Routes>

      </div>

      {isModalOpen && (
        <CreateDMModal
          onClose={() => setIsModalOpen(false)}
          onCreateDM={(friend) => handleAddDirectMessage(friend)}
        />
      )}
      {isSettingsOpen && (
        <div className="settings-modal-overlay">
          <SettingsPage
            userId={userId}
            onClose={() => setIsSettingsOpen(false)}
            onLogout={handleLogout}
          />
        </div>
      )}
    </div>
  );
}

export default App;
