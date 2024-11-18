/**
 * 
 * 
 * This component provides the user with account management options such as updating their username, email, avatar,
 * and password. It includes modals for changing the profile picture and password, and allows the user to log out.
 * 
 * Key Functionalities:
 * - Display and edit user details (username, email).
 * - Change profile picture through a modal.
 * - Update the password securely through a modal.
 * - Log out functionality.
 * - Reveals or hides the email address for privacy.
 * 
 * Props:
 * - `userId`: The ID of the logged-in user, used to fetch and update account details.
 * - `onClose`: Callback function to close the settings page.
 * - `onLogout`: Callback function to log the user out.
 */

import React, { useState, useEffect } from 'react';
import UserService from '../../Services/UserService';
import './SettingPage.css';

import defaultAv from '../Assets/default.jpg'

const SettingsPage = ({ userId, onClose, onLogout }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEmailRevealed, setIsEmailRevealed] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [newAvatar, setNewAvatar] = useState(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await UserService.getUserById(userId);
                const user = response.data.user;
                setUsername(user.username);
                setEmail(user.email);
                setAvatar(user.avatar);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [userId]);

    const updateUserField = async (updatedField) => {
        try {
            await UserService.updateUser(userId, updatedField);
            console.log("User updated successfully");
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    // Avatar functions
    const handleAvatarClick = () => {
        setIsAvatarModalOpen(true);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }

    };

    const handleSaveAvatar = async () => {
        if (!newAvatar) {
            console.log("No avatar selected");
            return;
        }

        try {
            await UserService.updateUserAvatar(userId, newAvatar);
            setAvatar(newAvatar);
            setIsAvatarModalOpen(false);
            console.log("Avatar updated successfully");
            window.location.reload();
        } catch (error) {
            console.error("Error updating avatar:", error);
        }
    };

    // Save the updated username
    const handleSaveUsername = async () => {
        setIsEditingUsername(false);
        await updateUserField({ username });
    };

    // Save the updated email
    const handleSaveEmail = async () => {
        setIsEditingEmail(false);
        await updateUserField({ email });
    };

    // Handle password change
    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        try {
            await UserService.changePassword(userId, currentPassword, newPassword);
            setIsPasswordModalOpen(false);
            setPasswordError('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            console.log("Password changed successfully");
        } catch (error) {
            setPasswordError("Error: Cannot Change Password");
            console.error("Error changing password:", error);
        }
    };

    const handleLogout = () => {
        onLogout();
    };

    return (
        <div className="settings-page">
            <div className="settings-close-btn-container">
                <button onClick={onClose} className="settings-close-btn">×</button>
                <span className="esc-label">ESC</span>
            </div>
            <div className="settings-content">
                <h1>My Account</h1>
                <div className="account-section">
                    <div className="account-header">
                        <div className="avatar-placeholder" onClick={handleAvatarClick}>
                            <img src={avatar || defaultAv} alt="Avatar" className="avatar-image" />
                            <div className="avatar-overlay">Edit</div>
                        </div>
                        <div className="account-info">
                            <h2>{username}</h2>
                        </div>
                    </div>
                    <div className="account-details">
                        <div className="detail-item">
                            <p>Username</p>
                            {isEditingUsername ? (
                                <div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <button onClick={handleSaveUsername} className="save-btn">Save</button>
                                </div>
                            ) : (
                                <div>
                                    <p>{username}</p>
                                    <button onClick={() => setIsEditingUsername(true)} className="edit-btn">Edit</button>
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="detail-item">
                            <p>Email</p>
                            {isEditingEmail ? (
                                <div>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <button onClick={handleSaveEmail} className="save-btn">Save</button>
                                </div>
                            ) : (
                                <div>
                                    <p>
                                        {isEmailRevealed ? email : '*********@gmail.com'}
                                        <span
                                            className="reveal"
                                            onClick={() => setIsEmailRevealed(!isEmailRevealed)}
                                        >
                                            {isEmailRevealed ? ' Hide' : ' Reveal'}
                                        </span>
                                    </p>
                                    <button onClick={() => setIsEditingEmail(true)} className="edit-btn">Edit</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isAvatarModalOpen && (
                    <div className="avatar-modal">
                        <h3>Change Profile Picture</h3>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                        <div className="button-container">
                            <button onClick={handleSaveAvatar} className="save-btn">Save</button>
                            <button onClick={() => setIsAvatarModalOpen(false)} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                )}

                <h2>Password and Authentication</h2>
                <div className="security-section">
                    <button className="change-password-btn" onClick={() => setIsPasswordModalOpen(true)}>Change Password</button>
                    <div className="authenticator-app">
                        <h3>Authenticator App</h3>
                        <p>Protect your account with an extra layer of security. Once configured, you’ll be required to enter your password and complete one additional step to sign in.</p>
                        <button className="enable-auth-btn">Enable Authenticator App</button>
                    </div>
                </div>

                {isPasswordModalOpen && (
                    <div className="password-modal">
                        <h3>Change Password</h3>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                        {passwordError && <p className="error-text">{passwordError}</p>}
                        <div className="button-container">
                            <button onClick={handleChangePassword} className="save-btn">Save</button>
                            <button onClick={() => setIsPasswordModalOpen(false)} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                )}

                <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
        </div>
    );
};

export default SettingsPage;
