/**
 * 
 * 
 * This component provides a dual-purpose interface for user authentication, supporting both login 
 * and registration functionalities. Users can toggle between the login and registration forms 
 * dynamically using a link.
 * 
 * Key Functionalities:
 * - Login: Authenticates users with email and password.
 * - Registration: Allows users to create a new account by providing username, email, and password.
 * - Displays error messages for login or registration failures.
 * 
 * Props:
 * - `onLogin`: Callback function triggered after a successful login, passing user details and token.
 */

import React, { useState } from "react";
import './LoginRegister.css';
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import UserService from "../../Services/UserService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginRegister = ({ onLogin }) => {
    const [action, setAction] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);

    const registerLink = () => setAction('active');
    const loginLink = () => setAction('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const loginResponse = await UserService.authenticateUser({ email, password });
            const token = loginResponse.data.token;
            localStorage.setItem("token", token);

            const userResponse = await UserService.getUserByEmail(email);
            const userId = userResponse.data.user.id;

            onLogin({ id: userId, token });
            toast.success("Login successful!");
        } catch (error) {
            setError("Invalid email or password.");
            toast.error("Error logging in. Please try again.");
            console.error("Error logging in:", error);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            await UserService.createUser({
                username,
                email,
                password
            });
            toast.success("Registration successful! You can now log in.");
            loginLink();
        } catch (error) {
            toast.error("Failed to register. Please try again.");
            console.error("Error registering user:", error);
        }
    };

    return (
        <div className={`wrapper ${action}`}>
            {/* ToastContainer for showing toast notifications */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="form-box login">
                <form onSubmit={handleLoginSubmit}>
                    <h1>Login</h1>
                    <div className="input-box">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <FaEnvelope className="icon" />
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <FaLock className="icon" />
                    </div>

                    <button type="submit">Login</button>
                    {error && <p className="error">{error}</p>}
                    <div className="register-link">
                        <p>Don't have an account? <a href="#" onClick={registerLink}>Register</a></p>
                    </div>
                </form>
            </div>
            <div className="form-box register">
                <form onSubmit={handleRegisterSubmit}>
                    <h1>Registration</h1>
                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <FaUser className="icon" />
                    </div>
                    <div className="input-box">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <FaEnvelope className="icon" />
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <FaLock className="icon" />
                    </div>

                    <button type="submit">Register</button>
                    <div className="register-link">
                        <p>Already have an account? <a href="#" onClick={loginLink}>Login</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginRegister;
