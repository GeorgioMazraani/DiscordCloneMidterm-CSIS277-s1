/**
 * UserService.js
 * 
 * This service file provides methods to interact with the backend API for managing user-related operations.
 * It abstracts the HTTP requests for user management, including CRUD operations, authentication, 
 * and other user-specific functionalities like updating the avatar or changing the password.
 * 
 * Key Features:
 * - Fetch all users or a user by ID, email, or username.
 * - Create, update, and delete user records.
 * - Authenticate users and manage their sessions.
 * - Change user passwords and update avatars.
 * 
 * Usage:
 * Import this service and call the required function with appropriate parameters.
 */
import http from "../http-common";
import { getTokenBearer } from "../Utils/Utils";

const getAllUsers = () => {
    return http.get("/users", {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const getUserById = (id) => {
    return http.get(`/users/${id}`, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const getUserByEmail = (email) => {
    return http.get(`/users/getByEmail/${email}`, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const getUserByUsername = (username) => {
    return http.get(`/users/username/${username}`, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const createUser = (data) => {
    return http.post("/users", data);
};

const updateUser = (id, data) => {
    return http.put(`/users/${id}`, data, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const deleteUser = (id) => {
    return http.delete(`/users/${id}`, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};

const authenticateUser = (credentials) => {
    return http.post("/users/auth/login", credentials);
};

const updateUserAvatar = (id, base64Avatar) => {
    return http.put(`/users/user/${id}/avatar`, JSON.stringify({ avatar: base64Avatar }), {
        headers: {
            Authorization: getTokenBearer(),
            'Content-Type': 'application/json'
        }
    });
};


const changePassword = (id, currentPassword, newPassword) => {
    return http.put(`/users/${id}/changePassword`, {
        currentPassword,
        newPassword
    }, {
        headers: {
            Authorization: getTokenBearer()
        }
    });
};
const registerFaceRecognition = (id, faceDescriptor) => {
    return http.post(
        `/users/${id}/register-face`,
        { faceDescriptor },
        {
            headers: {
                Authorization: getTokenBearer(),
                "Content-Type": "application/json",
            },
        }
    );
};



const UserService = {
    getAllUsers,
    getUserById,
    getUserByUsername,
    createUser,
    updateUser,
    deleteUser,
    authenticateUser,
    getUserByEmail,
    updateUserAvatar,
    changePassword,
    registerFaceRecognition
};

export default UserService;
