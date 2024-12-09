/**
 * This component provides the user with account management options such as updating their username, email, avatar,
 * and password. It includes modals for changing the profile picture and password, and allows the user to log out.
 *
 * Key Functionalities:
 * - Display and edit user details (username, email).
 * - Change profile picture through a modal.
 * - Update the password securely through a modal.
 * - Log out functionality.
 * - Reveals or hides the email address for privacy.
 * - Set up face recognition for user authentication.
 *
 * Props:
 * - `userId`: The ID of the logged-in user, used to fetch and update account details.
 * - `onClose`: Callback function to close the settings page.
 * - `onLogout`: Callback function to log the user out.
 */

import React, { useState, useEffect, useRef } from 'react';
import UserService from '../../Services/UserService';
import * as faceapi from 'face-api.js';
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

    const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
    const [faceRegistrationSuccess, setFaceRegistrationSuccess] = useState(false);
    const [notification, setNotification] = useState('');
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Refs for face modal
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [detectionFrameId, setDetectionFrameId] = useState(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                setModelsLoaded(true);
            } catch (error) {
                console.error("Error loading Face-api.js models:", error);
                alert("Failed to load models. Face recognition will not work.");
            }
        };
        loadModels();
    }, []);

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

    const handleFaceSetup = async () => {
        setIsFaceModalOpen(true);
    };

    // Start camera when modal opens
    useEffect(() => {
        if (isFaceModalOpen && modelsLoaded) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFaceModalOpen, modelsLoaded]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                await videoRef.current.play();
                startDetectionLoop();
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setNotification("Unable to access the camera. Please grant permission.");
            setTimeout(() => setNotification(''), 5000);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        if (detectionFrameId) {
            cancelAnimationFrame(detectionFrameId);
            setDetectionFrameId(null);
        }
    };

    const startDetectionLoop = async () => {
        const detectFace = async () => {
            if (!videoRef.current || !canvasRef.current) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);

            const detection = await faceapi
                .detectSingleFace(video)
                .withFaceLandmarks()
                .withFaceDescriptor();

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detection) {
                const resizedDetections = faceapi.resizeResults(detection, displaySize);
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            }

            const frameId = requestAnimationFrame(detectFace);
            setDetectionFrameId(frameId);
        };
        detectFace();
    };

    const handleRegisterFace = async () => {
        if (!modelsLoaded) {
            setNotification("Models are still loading, please wait...");
            setTimeout(() => setNotification(''), 5000);
            return;
        }

        try {
            const video = videoRef.current;
            const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

            if (detection) {
                const faceDescriptor = detection.descriptor; // The descriptor is a Float32Array
                await UserService.registerFaceRecognition(userId, Array.from(faceDescriptor));
                setFaceRegistrationSuccess(true);
                setNotification("Face registered successfully!");
                setIsFaceModalOpen(false);
            } else {
                setNotification("Face not detected. Please try again.");
            }
        } catch (error) {
            console.error("Error registering face:", error);
            setNotification("Failed to register face. Please try again.");
        }

        setTimeout(() => setNotification(''), 5000);
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
            setNotification("Password updated successfully!");
            console.log("Password changed successfully");

            // Automatically clear the notification after 5 seconds
            setTimeout(() => {
                setNotification('');
            }, 5000);
        } catch (error) {
            setPasswordError("Error: Cannot change password");
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
                {/* Display notification if present at the top of the content */}
                {notification && (
                    <div className="notification">
                        {notification}
                    </div>
                )}

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

                <h2>Password and Security</h2>
                <div className="password-section">
                    <h3>Change Password</h3>
                    <p className="password-help-text">Ensure your account is secure by updating your password regularly.</p>
                    <button className="change-password-btn" onClick={() => setIsPasswordModalOpen(true)}>Change Password</button>
                </div>

                <div className="face-auth-section">
                    <h3>Face Recognition Login</h3>
                    <p>Protect your account with an extra layer of security by setting up face recognition. Once configured, you can use your face to log in securely.</p>
                    <button className="setup-face-btn" onClick={handleFaceSetup}>
                        {faceRegistrationSuccess ? "Re-register Face" : "Set Up Face"}
                    </button>
                </div>

                {isFaceModalOpen && (
                    <div className="face-modal">
                        <h3>Set Up Face Recognition</h3>
                        <p>Position your face in front of the camera to capture it for login.</p>
                        <div className="camera-container">
                            <video ref={videoRef} className="video-feed" autoPlay muted />
                            <canvas ref={canvasRef} className="overlay-canvas"></canvas>
                        </div>
                        <div className="button-container">
                            <button onClick={handleRegisterFace} className="save-btn">Register Face</button>
                            <button onClick={() => setIsFaceModalOpen(false)} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                )}

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
