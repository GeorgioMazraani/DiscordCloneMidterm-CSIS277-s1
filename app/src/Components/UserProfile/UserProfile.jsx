/**
 * 
 * 
 * This component displays the user's profile information, including their avatar, username, status,
 * and settings options. It allows the user to:
 * - View and update their status (Online, Idle, Do Not Disturb, Invisible).
 * - Mute/unmute their microphone.
 * - Toggle headphone sound.
 * - Access settings via a button.
 * 
 * Key Features:
 * - Fetch user data from the backend on component mount.
 * - Update mute, headphone, and status settings in real-time.
 * - Status menu with click outside detection to close.
 * - Responsive layout styled with `UserProfile.css`.
 * 
 * Props:
 * - `onSettingsClick`: Callback function triggered when the settings button is clicked.
 * - `userId`: ID of the logged-in user for fetching and updating user data.
 */


import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophoneSlash, FaHeadphones } from "react-icons/fa";
import { FaMicrophone } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { TbHeadphonesOff } from "react-icons/tb";
import { BsMoonFill, BsCircleFill } from "react-icons/bs";
import { RiStopCircleFill } from 'react-icons/ri';
import StatusMenu from '../StatusMenu/StatusMenu';
import UserService from '../../Services/UserService';
import './UserProfile.css';
import defaultAv from '../Assets/default.jpg';
import muteMicSound from '../Assets/sounds/mute-mic.mp3';
import muteHeadphonesSound from '../Assets/sounds/mute-mic.mp3';

const UserProfile = ({ onSettingsClick, userId }) => {
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isHeadphonesOn, setIsHeadphonesOn] = useState(false);
    const [status, setStatus] = useState('Idle');
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
    const statusMenuRef = useRef(null);

    const muteMicAudio = new Audio(muteMicSound);
    const muteHeadphonesAudio = new Audio(muteHeadphonesSound);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await UserService.getUserById(userId);
                const { username, avatar, isMuted, isHeadphonesOn, status } = response.data.user;
                setUsername(username);
                setAvatar(avatar);
                setIsMuted(isMuted);
                setIsHeadphonesOn(isHeadphonesOn);
                setStatus(status);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [userId]);

    const toggleMute = async () => {
        try {
            const newMuteStatus = !isMuted;
            setIsMuted(newMuteStatus);
            muteMicAudio.play();
            await UserService.updateUser(userId, { isMuted: newMuteStatus });
        } catch (error) {
            console.error("Error updating mute status:", error);
        }
    };

    const toggleHeadphones = async () => {
        try {
            const newHeadphonesStatus = !isHeadphonesOn;
            setIsHeadphonesOn(newHeadphonesStatus);
            muteHeadphonesAudio.play();
            await UserService.updateUser(userId, { isHeadphonesOn: newHeadphonesStatus });
        } catch (error) {
            console.error("Error updating headphones status:", error);
        }
    };

    const handleStatusClick = () => setIsStatusMenuOpen(!isStatusMenuOpen);

    const handleStatusSelect = async (newStatus) => {
        try {
            setStatus(newStatus);
            setIsStatusMenuOpen(false);
            await UserService.updateUser(userId, { status: newStatus });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleClickOutside = (event) => {
        if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
            setIsStatusMenuOpen(false);
        }
    };

    useEffect(() => {
        if (isStatusMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isStatusMenuOpen]);

    return (
        <div className="user-profile">
            <div className="user-avatar" onClick={handleStatusClick}>
                <img
                    src={avatar || defaultAv}
                    alt="User Avatar"
                    className="avatar-image"
                />
                {status === 'Online' && <BsCircleFill className="status-overlay online" />}
                {status === 'Idle' && <BsMoonFill className="status-overlay idle" />}
                {status === 'Do Not Disturb' && <RiStopCircleFill className="status-overlay dnd" />}
                {status === 'Invisible' && <BsCircleFill className="status-overlay invisible" />}
            </div>

            <div className="user-info">
                <span className="username" onClick={handleStatusClick}>
                    {username}
                </span>
                <span className="status-text">
                    {status}
                </span>
            </div>
            <div className="settings-icons">
                <button className="icon" onClick={toggleMute}>
                    {isMuted ? <FaMicrophoneSlash color="#f04747" /> : <FaMicrophone />}
                </button>
                <button className="icon" onClick={toggleHeadphones}>
                    {isHeadphonesOn ? <FaHeadphones /> : <TbHeadphonesOff color="#f04747" />}
                </button>

                <button className="icon" onClick={onSettingsClick}>
                    <IoMdSettings />
                </button>
            </div>

            {isStatusMenuOpen && (
                <div ref={statusMenuRef} className="status-menu-container">
                    <StatusMenu
                        onSelectStatus={handleStatusSelect}
                        onClose={() => setIsStatusMenuOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default UserProfile;
