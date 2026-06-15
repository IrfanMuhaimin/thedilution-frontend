import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import * as chatService from '../services/chatService';
// Reuse your existing notification sound
import notificationSound from '../assets/notification.mp3';

const ChatContext = createContext(null);
const audio = new Audio(notificationSound);

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadChatTotal, setUnreadChatTotal] = useState(0);
    const [contacts, setContacts] = useState([]);

    // 1. Initialize Socket Connection
    useEffect(() => {
        if (!user || user.status === 'inactive' || user.isFirstLogin) return;

        // Connect to the backend URL (assuming it runs on the same domain or define explicitly)
        // If your API is http://localhost:8080/api, socket connects to http://localhost:8080
        const socketUrl = process.env.REACT_APP_API_URL.replace('/api', '');
        const newSocket = io(socketUrl);

        newSocket.on('connect', () => {
            console.log('🔗 Connected to Chat Server');
            newSocket.emit('register', user.userId);
        });

        newSocket.on('active_users', (usersArray) => {
            setOnlineUsers(usersArray);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // 2. Fetch Initial Contacts & Unread Count
    const refreshContacts = useCallback(async () => {
        if (!user) return;
        try {
            const data = await chatService.getContacts();
            setContacts(data);
            const totalUnread = data.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0);
            setUnreadChatTotal(totalUnread);
        } catch (err) {
            console.error("Failed to load chat contacts", err);
        }
    }, [user]);

    useEffect(() => {
        refreshContacts();
    }, [refreshContacts]);

    // 3. Listen for Incoming Messages globally
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            // Play sound and update total unread badge
            audio.play().catch(e => console.log("Audio play prevented"));
            refreshContacts(); // Refresh the contact list to update unread counts and last message
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, refreshContacts]); // audio is static

    return (
        <ChatContext.Provider value={{ socket, onlineUsers, unreadChatTotal, contacts, refreshContacts }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);