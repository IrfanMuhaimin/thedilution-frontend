import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import * as notificationService from '../services/notificationService';
import * as userService from '../services/userService'; // Added to check status
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';
import notificationSound from '../assets/notification.mp3';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user, updateUserInfo } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [latestNotif, setLatestNotif] = useState(null);
    const lastNotifId = useRef(null);

    const audio = new Audio(notificationSound);

    const fetchSystemData = async () => {
        if (!user) return;

        try {
            // 1. SYNC STATUS: Check if Admin has deactivated this account
            const profile = await userService.getMyProfile();
            if (profile.status === 'inactive' && user.status !== 'inactive') {
                updateUserInfo({ status: 'inactive' });
                return; // Stop further processing if locked out
            }

            // 2. FETCH NOTIFICATIONS (Only if still active)
            if (profile.status === 'active') {
                const data = await notificationService.getMyNotifications();
                const sortedData = data.sort((a, b) => b.notificationId - a.notificationId);
                const unread = sortedData.filter(n => !n.isRead);
                
                setUnreadCount(unread.length);
                setNotifications(sortedData);

                if (sortedData.length > 0) {
                    const newest = sortedData[0];
                    if (lastNotifId.current !== null && newest.notificationId > lastNotifId.current && !newest.isRead) {
                        setLatestNotif(newest);
                        setShowToast(true);
                        audio.play().catch(e => console.log("Audio waiting for user interaction"));
                    }
                    lastNotifId.current = newest.notificationId;
                }
            }
        } catch (err) {
            console.error("Heartbeat sync failed", err);
        }
    };

    useEffect(() => {
        fetchSystemData();
        const interval = setInterval(fetchSystemData, 10000); // Heartbeat every 10s
        return () => clearInterval(interval);
    }, [user]);

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            fetchSystemData,
            fetchNotifications: fetchSystemData
        }}>
            {children}
            <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 10001 }}>
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide className="notification-toast">
                    <Toast.Header>
                        <FaBell className="me-2 text-primary" />
                        <strong className="me-auto">System Alert</strong>
                        <small>Just now</small>
                    </Toast.Header>
                    <Toast.Body className="fw-bold">{latestNotif?.message}</Toast.Body>
                </Toast>
            </ToastContainer>
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);