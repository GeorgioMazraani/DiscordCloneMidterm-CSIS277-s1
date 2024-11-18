/**
 * 
 * 
 * This component provides a modal interface for creating a new channel within a server.
 * Users can select the channel type (text or voice), name the channel, and optionally set it as private.
 * 
 * Key Functionalities:
 * - Allows users to select a channel type (Text or Voice).
 * - Accepts user input for the channel name.
 * - Sends the new channel details to the backend via the `ChannelService`.
 * - Notifies the parent component of the created channel upon success.
 * 
 * Props:
 * - `isOpen`: Boolean controlling the visibility of the modal.
 * - `onClose`: Callback function to close the modal.
 * - `serverId`: The ID of the server where the channel is being created.
 * - `onChannelCreated`: Callback function triggered after a channel is successfully created, passing the created channel data.
 */

import React, { useState } from "react";
import "./CreateChannelModal.css";
import { FaHashtag, FaVolumeUp } from "react-icons/fa";
import ChannelService from "../../Services/ChannelService";

const CreateChannelModal = ({ isOpen, onClose, serverId, onChannelCreated }) => {
    const [channelType, setChannelType] = useState("text");
    const [channelName, setChannelName] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);

    if (!isOpen) return null;

    const handleCreateChannel = async () => {
        if (!channelName.trim()) {
            alert("Channel name cannot be empty.");
            return;
        }

        try {
            const channelData = {
                name: channelName,
                type: channelType,
                serverId: serverId,
                isPrivate: isPrivate,
            };

            console.log("Channel data sent to API:", channelData);

            const createdChannel = await ChannelService.createChannel(channelData);
            console.log("Created channel response:", createdChannel);

            onChannelCreated(createdChannel);
            onClose();
        } catch (error) {
            console.error("Error creating channel:", error);
            alert("Failed to create channel.");
        }
    };


    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-body">
                    <h3>CHANNEL TYPE</h3>
                    <div className="channel-type">
                        <div
                            className={`channel-option ${channelType === "text" ? "selected" : ""
                                }`}
                            onClick={() => setChannelType("text")}
                        >
                            <FaHashtag />
                            <span>Text</span>
                            <p>Send messages, images, GIFs, emoji, opinions, and puns</p>
                        </div>
                        <div
                            className={`channel-option ${channelType === "voice" ? "selected" : ""
                                }`}
                            onClick={() => setChannelType("voice")}
                        >
                            <FaVolumeUp />
                            <span>Voice</span>
                            <p>Hang out together with voice, video, and screen share</p>
                        </div>
                    </div>

                    <h3>CHANNEL NAME</h3>
                    <div className="channel-name-input">
                        <FaHashtag />
                        <input
                            type="text"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            placeholder="new-channel"
                        />
                    </div>

                </div>
                <div className="modal-footer">
                    <button className="cancel-button" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="create-button" onClick={handleCreateChannel}>
                        Create Channel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateChannelModal;
