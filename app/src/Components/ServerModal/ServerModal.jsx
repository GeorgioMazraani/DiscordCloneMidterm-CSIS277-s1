/**
 * 
 * 
 * This component provides a modal interface for creating a new server. It allows users to specify 
 * the server name and upload an optional icon. The server creation process includes validating input
 * and interacting with the backend through the `ServerService`.
 * 
 * Key Functionalities:
 * - Allows users to input a server name.
 * - Supports image upload for the server icon.
 * - Sends the server creation request to the backend.
 * - Displays loading feedback during the creation process.
 * - Handles errors and notifies the user if the server creation fails.
 * 
 * Props:
 * - `onClose`: Callback function to close the modal.
 * - `onServerCreated`: Callback function triggered when the server is successfully created, 
 *    passing the newly created server data.
 */

import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineClose } from 'react-icons/ai';
import './ServerModal.css';
import ServerService from '../../Services/ServerService';

const ServerModal = ({ onClose, onServerCreated }) => {
    const [serverName, setServerName] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setUploadedImage(imageUrl);
            setImageFile(file);
        }
    };

    const handleCreate = async () => {
        if (!serverName.trim()) {
            alert('Server name is required!');
            return;
        }

        setLoading(true);

        try {
            const ownerId = localStorage.getItem('userId');
            console.log("Creating server with data:", { serverName, ownerId, imageFile });

            const response = await ServerService.createServer(serverName, ownerId, imageFile);

            onServerCreated(response.server);

            onClose();
        } catch (error) {
            console.error('Error creating server:', error.response?.data || error.message);
            alert('Failed to create server. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Customize Your Server</h2>
                    <AiOutlineClose className="close-icon" onClick={onClose} />
                </div>
                <p className="subtitle">
                    Give your new server a personality with a name and an icon. You can always change it later.
                </p>

                <div className="upload-section">
                    <label className="upload-label">
                        <input type="file" onChange={handleImageUpload} />
                        {uploadedImage ? (
                            <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
                        ) : (
                            <div className="upload-icon">
                                <AiOutlinePlus size={20} />
                            </div>
                        )}
                        <span>{uploadedImage ? '' : 'UPLOAD'}</span>
                    </label>
                </div>

                <div className="input-section">
                    <label className="input-label">SERVER NAME</label>
                    <input
                        type="text"
                        placeholder="Enter server name"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                    />
                </div>

                <p className="disclaimer">
                    By creating a server, you agree to Discord's <a href="#">Community Guidelines</a>.
                </p>

                <div className="modal-buttons">
                    <button className="back-button" onClick={onClose} disabled={loading}>
                        Back
                    </button>
                    <button className="create-button" onClick={handleCreate} disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServerModal;
