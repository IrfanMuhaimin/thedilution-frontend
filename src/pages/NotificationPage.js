import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import * as notificationService from '../services/notificationService';

function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await notificationService.getMyNotifications();
            // Sort notifications to show the newest first
            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setNotifications(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markNotificationAsRead(notificationId);
            // Refresh the list to show the change
            fetchNotifications(); 
        } catch (err) {
            setError(err.message);
        }
    };

    const getSeverityBadge = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'secondary';
        }
    };

    return (
        <Card className="shadow-sm border-light-subtle">
            <Card.Header className="bg-white py-3">
                <h2 className="mb-0">Notifications</h2>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" /></div>
                ) : (
                    <ListGroup variant="flush">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <ListGroup.Item 
                                    key={notif.notificationId} 
                                    className={`d-flex justify-content-between align-items-center ${!notif.isRead ? 'fw-bold' : 'text-muted'}`}
                                >
                                    <div>
                                        <Badge pill bg={getSeverityBadge(notif.severity)} className="me-2">
                                            {notif.severity || 'Info'}
                                        </Badge>
                                        {notif.message}
                                        <div className="text-muted small mt-1">
                                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                        </div>
                                    </div>
                                    {!notif.isRead && (
                                        <Button 
                                            variant="outline-success" 
                                            size="sm"
                                            onClick={() => handleMarkAsRead(notif.notificationId)}
                                        >
                                            <FaCheckCircle className="me-2" /> Mark as Read
                                        </Button>
                                    )}
                                </ListGroup.Item>
                            ))
                        ) : (
                            <ListGroup.Item className="text-center text-muted">You have no new notifications.</ListGroup.Item>
                        )}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
}

export default NotificationPage;