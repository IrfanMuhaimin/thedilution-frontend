import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

// Helper function to decode JWT and check expiration
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        // JWTs have 3 parts separated by dots. The payload is the 2nd part.
        const payload = JSON.parse(atob(token.split('.')[1]));
        // payload.exp is in seconds, Date.now() is in milliseconds
        return Date.now() >= payload.exp * 1000;
    } catch (e) {
        return true; // If token is malformed, assume it's expired
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Initial Load: Check if token exists and is valid
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (isTokenExpired(parsedUser.token)) {
                // Token is already expired on load
                localStorage.removeItem('user');
                setUser(null);
            } else {
                setUser(parsedUser);
            }
        }
        setLoading(false);
    }, []);

    // 2. Active Session Monitor: Check token every 1 minute
    useEffect(() => {
        if (!user || !user.token) return;

        const intervalId = setInterval(() => {
            if (isTokenExpired(user.token)) {
                console.log("Session expired. Automatically logging out.");
                logout("Your session has expired for security reasons. Please log in again.");
            }
        }, 60000); // 60000 ms = 1 minute

        return () => clearInterval(intervalId); // Cleanup timer on unmount
    }, [user]);

    const updateUserInfo = (newData) => {
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...newData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    const login = async (username, password) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed.');
            }

            const data = await response.json();

            const userData = {
                userId: data.userId,
                username: data.username,
                role: data.role,
                token: data.accessToken,
                isFirstLogin: data.isFirstLogin,
                profilePicture: data.profilePicture,
                status: data.status
            };

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            if (userData.isFirstLogin) {
                navigate('/complete-profile');
            } else {
                navigate('/');
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // 3. Logout function now accepts an optional message
    const logout = (message = null) => {
        setUser(null);
        localStorage.removeItem('user');
        
        // Navigate to login, passing the message in the router state
        if (message && typeof message === 'string') {
            navigate('/login', { state: { sessionMessage: message } });
        } else {
            navigate('/login');
        }
    };

    const value = { user, login, logout, updateUserInfo, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};