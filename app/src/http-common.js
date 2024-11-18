import axios from "axios";
import { getTokenBearer } from "./Utils/Utils";

let onSessionExpired = null;

export const setOnSessionExpired = (handler) => {
    onSessionExpired = handler;
};

const http = axios.create({
    baseURL: "http://localhost:4000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

http.interceptors.request.use(
    (config) => {
        const token = getTokenBearer();
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Call the session expiration handler if it exists
            if (onSessionExpired) {
                onSessionExpired();
            }
        }
        return Promise.reject(error);
    }
);

export default http;
