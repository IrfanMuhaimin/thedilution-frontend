import React, { useState } from 'react';
import { ListGroup, Button, Card, Alert, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaBullhorn, FaEnvelope } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
// 1. IMPORT THE NOTIFICATION CONTEXT HOOK
import { useNotifications } from '../context/NotificationContext'; 
import * as notificationService from '../services/notificationService';
import BroadcastModal from '../components/BroadcastModal';

function NotificationPage() {
    const { user } = useAuth();
    // 2. CONSUME THE GLOBAL NOTIFICATION DATA (Instantly real-time!)
    const { notifications, fetchNotifications } = useNotifications(); 
    
    const isAdmin = user?.role === 'Admin';
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [error, setError] = useState('');

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markNotificationAsRead(notificationId);
            // 3. Immediately trigger a global refresh so both header and page update instantly
            fetchNotifications(); 
        } catch (err) {
            setError(err.message);
        }
    };

    const handleBroadcastAnnouncement = async (announcementData) => {
        try {
            const res = await notificationService.broadcastAnnouncement(announcementData);
            alert(res.message);
            // Immediately refresh so it pops up on the admin's screen too
            fetchNotifications(); 
        } catch (err) {
            alert("Broadcast failed: " + err.message);
        }
    };

    const getSeverityBadge = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high': return 'danger';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'secondary';
        }
    };

    return (
        <>
            <Card className="shadow-sm border-0 rounded-4">
                <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-0">
                    <h2 className="mb-0 text-primary fw-bold">Notification Center</h2>
                    
                    {isAdmin && (
                        <Button className="btn-custom-primary rounded-pill px-4 shadow-sm" onClick={() => setShowBroadcastModal(true)}>
                            <FaBullhorn className="me-2" /> Compose Broadcast
                        </Button>
                    )}
                </Card.Header>
                <Card.Body className="p-4 bg-light">
                    {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                    
                    {/* 4. We removed the 'loading' spinner! The list is populated instantly from the global context */}
                    <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                        <ListGroup variant="flush">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <ListGroup.Item 
                                        key={notif.notificationId} 
                                        className={`p-4 d-flex justify-content-between align-items-center border-bottom ${!notif.isRead ? 'bg-light-subtle fw-bold' : 'text-muted'}`}
                                        style={!notif.isRead ? { borderLeft: '4px solid #043873' } : {}}
                                    >
                                        <div className="d-flex align-items-start gap-3">
                                            <Badge pill bg={getSeverityBadge(notif.severity)} className="px-3 py-2 mt-1">
                                                {notif.severity || 'Info'}
                                            </Badge>
                                            <div>
                                                <div style={{ whiteSpace: 'pre-line', fontSize: '0.95rem' }} className="text-dark">
                                                    {notif.message}
                                                </div>
                                                <div className="text-muted small mt-2">
                                                    {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                                </div>
                                            </div>
                                        </div>
                                        {!notif.isRead && (
                                            <Button 
                                                variant="outline-success" 
                                                size="sm"
                                                className="rounded-pill px-3 shadow-sm"
                                                onClick={() => handleMarkAsRead(notif.notificationId)}
                                            >
                                                <FaCheckCircle className="me-2" /> Mark Read
                                            </Button>
                                        )}
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <FaEnvelope size={40} className="mb-3 opacity-50" />
                                    <p className="mb-0">Your notification center is empty.</p>
                                </div>
                            )}
                        </ListGroup>
                    </div>
                </Card.Body>
            </Card>

            <BroadcastModal 
                show={showBroadcastModal}
                handleClose={() => setShowBroadcastModal(false)}
                onBroadcast={handleBroadcastAnnouncement}
            />
        </>
    );
}

export default NotificationPage;