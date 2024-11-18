/**
 * 
 * 
 * This component provides a modal interface for editing server details, including the server name 
 * and server image. It also supports deleting the server. Changes are saved via backend API calls 
 * using the `ServerService`.
 * 
 * Key Functionalities:
 * - Edit server name and image, and preview the updated image.
 * - Save changes to the server details.
 * - Delete the server with a confirmation prompt.
 * - Provides visual feedback during deletion (e.g., disabling the delete button while processing).
 * 
 * Props:
 * - `isOpen`: Boolean to control the visibility of the modal.
 * - `onClose`: Callback function to close the modal.
 * - `onSave`: Callback function triggered after saving or deleting the server, passing updated server details.
 * - `serverId`: ID of the server to edit.
 * - `initialName`: Initial name of the server.
 * - `initialImage`: Initial image of the server.
 */

import React, { useState } from 'react';
import './EditServerModal.css';
import { FaTimes } from 'react-icons/fa';
import ServerService from '../../Services/ServerService';

const EditServerModal = ({ isOpen, onClose, onSave, serverId, initialName, initialImage }) => {
    const [serverName, setServerName] = useState(initialName);
    const [serverImage, setServerImage] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setServerImage(file);
    };

    const handleSave = async () => {
        try {
            if (serverName !== initialName) {
                await ServerService.updateServerDetails(serverId, serverName);
            }

            if (serverImage) {
                await ServerService.updateServerIcon(serverId, serverImage);
            }

            onSave({
                id: serverId,
                name: serverName,
                image: serverImage ? URL.createObjectURL(serverImage) : initialImage,
            });
            window.location.reload();

            onClose();
        } catch (error) {
            console.error("Error updating server:", error);
            alert("Failed to update server.");
        }
    };


    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this server? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await ServerService.deleteServer(serverId);
            alert("Server deleted successfully.");
            onSave(null);
            onClose();
        } catch (error) {
            console.error("Error deleting server:", error);
            alert("Failed to delete server.");
        } finally {
            setIsDeleting(false);
        }
        window.location.reload();
    };

    return isOpen ? (
        <div className="edit-server-modal-overlay">
            <div className="edit-server-modal">
                <div className="modal-header">
                    <h2>Edit Server</h2>
                    <FaTimes className="close-icon" onClick={onClose} />
                </div>

                <div className="modal-body">
                    <label>Server Name</label>
                    <input
                        type="text"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                    />

                    <label>Server Image</label>
                    <div className="image-upload">
                        {initialImage && !serverImage && (
                            <img src={initialImage} alt="Server" className="server-image-preview" />
                        )}
                        {serverImage && (
                            <img
                                src={URL.createObjectURL(serverImage)}
                                alt="Server Preview"
                                className="server-image-preview"
                            />
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                    <button className="delete-button" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete Server"}
                    </button>
                </div>
            </div>
        </div>
    ) : null;
};

export default EditServerModal;
