/**
 * This component provides login and registration functionalities. It allows logging in by either email/password
 * or face descriptor. If the user selects face login, it will open the camera, detect the user's face using face-api.js,
 * and show a video feed with a detection overlay. Once a face is detected, the descriptor is stored and used for login.
 */

import React, { useState, useRef, useEffect } from "react";
import './LoginRegister.css';
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import UserService from "../../Services/UserService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as faceapi from 'face-api.js';

const LoginRegister = ({ onLogin }) => {
    const [action, setAction] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);

    // New state for choosing login method
    const [useFaceLogin, setUseFaceLogin] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [stream, setStream] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // This will hold the captured face descriptor once found
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const [detectionFrameId, setDetectionFrameId] = useState(null);

    const registerLink = () => setAction('active');
    const loginLink = () => setAction('');

    useEffect(() => {
        // Load Face-api models
        const loadModels = async () => {
            try {
                await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
                await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
                await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
                setModelsLoaded(true);
            } catch (err) {
                console.error("Error loading models:", err);
                toast.error("Failed to load face models.");
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (useFaceLogin && modelsLoaded) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [useFaceLogin, modelsLoaded]);

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
            toast.error("Unable to access camera. Please grant permission.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (detectionFrameId) {
            cancelAnimationFrame(detectionFrameId);
            setDetectionFrameId(null);
        }
        // Clear faceDescriptor when camera is stopped (optional)
        setFaceDescriptor(null);
    };

    const startDetectionLoop = async () => {
        const detectFace = async () => {
            if (!videoRef.current || !canvasRef.current) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);

            const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detection) {
                const resizedDetections = faceapi.resizeResults(detection, displaySize);
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

                // We have a face descriptor from this detection
                setFaceDescriptor(Array.from(detection.descriptor));
            }

            const frameId = requestAnimationFrame(detectFace);
            setDetectionFrameId(frameId);
        };
        detectFace();
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            let credentials;
            if (useFaceLogin) {
                if (!faceDescriptor) {
                    toast.error("No face detected yet. Please align your face in front of the camera.");
                    return;
                }
                // Face-only login with descriptor
                credentials = { faceDescriptor };
            } else {
                // Email + Password login
                credentials = { email, password };
            }

            const loginResponse = await UserService.authenticateUser(credentials);
            const token = loginResponse.data.token;
            localStorage.setItem("token", token);

            let userId;
            if (credentials.email) {
                const userResponse = await UserService.getUserByEmail(email);
                userId = userResponse.data.user.id;
            } else {
                // If face-only login, user details come from the loginResponse
                userId = loginResponse.data.user.id;
            }

            onLogin({ id: userId, token });
            toast.success("Login successful!");

            // If we used face login, stop the camera after successful login
            if (useFaceLogin) {
                stopCamera();
                setUseFaceLogin(false); // reset to email/password mode if desired
            }
        } catch (error) {
            setError("Invalid credentials.");
            toast.error("Error logging in. Please try again.");
            console.error("Error logging in:", error);
        }
    };


    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        try {
            await UserService.createUser({ username, email, password });
            toast.success("Registration successful! You can now log in.");
            loginLink();
        } catch (error) {

            if (error.response && error.response.data.errors) {
                const errorMessages = {};
                error.response.data.errors.forEach((err) => {
                    errorMessages[err.path] = err.msg; // Map 'path' (field name) to 'msg' (error message)
                });
                console.log("test", errorMessages)
                setError(errorMessages);
            } else {
                toast.error("Failed to register. Please try again.");
                console.error("Registration error:", error);
            }
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
                    <div className="login-method-toggle">
                        <label>
                            <input
                                type="radio"
                                name="loginMethod"
                                checked={!useFaceLogin}
                                onChange={() => setUseFaceLogin(false)}
                            />
                            Email/Password
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="loginMethod"
                                checked={useFaceLogin}
                                onChange={() => setUseFaceLogin(true)}
                            />
                            Face Login
                        </label>
                    </div>

                    {!useFaceLogin && (
                        <>
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
                        </>
                    )}

                    {useFaceLogin && (
                        <div className="face-login-section">
                            <p className="face-info">
                                Align your face in front of the camera. Once detected, click "Login".
                            </p>
                            <div className="video-container">
                                <video ref={videoRef} className="video-feed" autoPlay muted></video>
                                <canvas ref={canvasRef} className="overlay-canvas"></canvas>
                            </div>

                            {faceDescriptor ? (
                                <p className="face-detected">Face Detected! You can now log in.</p>
                            ) : (
                                <p className="face-detected">No face detected yet...</p>
                            )}
                        </div>
                    )}

                    <button type="submit">Login</button>
                    {error?.username && <p className="error-message">{error.username}</p>}
                    {error?.email && <p className="error-message">{error.email}</p>}
                    {error?.password && <p className="error-message">{error.password}</p>}

                    <div className="register-link">
                        <p>Don't have an account? <a href="#" onClick={registerLink}>Register</a></p>
                    </div>
                </form>
            </div>
            <div className="form-box register">
                <form onSubmit={handleRegisterSubmit}>
                    <h1>Registration</h1>
                    <div className={`input-box ${error?.username ? "error" : ""}`}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <FaUser className="icon" />
                        {error?.username && <p className="error-message">{error.username}</p>}
                    </div>


                    <div className={`input-box ${error?.email ? "error" : ""}`}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <FaEnvelope className="icon" />
                        {error?.email && <p className="error-message">{error.email}</p>}
                    </div>


                    <div className={`input-box ${error?.password ? "error" : ""}`}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <FaLock className="icon" />
                        {error?.password && <p className="error-message">{error.password}</p>}
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
