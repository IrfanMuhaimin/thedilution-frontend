import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Form, Button, InputGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaCommentDots, FaPaperPlane, FaSearch, FaFileMedical, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import * as chatService from '../services/chatService';
import { formatDistanceToNow, format } from 'date-fns';
import '../styles/ChatPage.css';

function ChatPage() {
    const { user } = useAuth();
    const { socket, onlineUsers, contacts, refreshContacts } = useChat();
    const location = useLocation();

    // 1. UI States
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typedMessage, setTypedMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [error, setError] = useState('');
    const [attachedJobcard, setAttachedJobcard] = useState(null);

    // 2. Refs
    const messagesEndRef = useRef(null);
    const hasRedirectedRef = useRef(false); 

    // 3. Callback functions (DEFINED AT THE TOP to prevent scoping warnings)
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectContact = useCallback(async (contact) => {
        setActiveContact(contact);
        setLoadingHistory(true);
        setError('');
        try {
            const history = await chatService.getConversation(contact.userId);
            setMessages(history);
            refreshContacts(); 
        } catch (err) {
            setError("Could not load message history.");
        } finally {
            setLoadingHistory(false);
        }
    }, [refreshContacts]);

    const handleSendMessage = (e, customContent = null) => {
        if (e) e.preventDefault();
        
        const textToSend = customContent || typedMessage.trim();
        if (!textToSend || !socket || !activeContact) return;

        const payload = {
            senderId: user.userId,
            receiverId: activeContact.userId,
            content: textToSend
        };

        socket.emit("send_message", payload);

        const optimisticMsg = {
            ...payload,
            messageId: Date.now(),
            timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, optimisticMsg]);
        if (!customContent) setTypedMessage('');
        
        setTimeout(refreshContacts, 200);
    };

    const handleSendReference = () => {
        if (!attachedJobcard) return;
        const referenceText = `📌 [REFERENCE] Jobcard #${attachedJobcard.id}\nMedication: ${attachedJobcard.name}\nStatus: ${attachedJobcard.status}`;
        handleSendMessage(null, referenceText);
        setAttachedJobcard(null); 
    };

    const isUserOnline = (userId) => onlineUsers.includes(userId);
    const getInitials = (name) => name?.charAt(0).toUpperCase() || 'U';

    // 4. Effects (DEFINED BELOW callbacks so they can safely call handleSelectContact)
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (hasRedirectedRef.current) return;

        if (location.state && location.state.contactId && contacts.length > 0) {
            const targetContact = contacts.find(c => c.userId === location.state.contactId);
            if (targetContact) {
                handleSelectContact(targetContact);
                if (location.state.jobcardRef) {
                    setAttachedJobcard(location.state.jobcardRef);
                }
                hasRedirectedRef.current = true; 
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, contacts, handleSelectContact]);

    useEffect(() => {
        if (!socket || !activeContact) return;

        const handleIncomingMessage = (msg) => {
            if (msg.senderId === activeContact.userId) {
                setMessages(prev => [...prev, msg]);
                chatService.getConversation(activeContact.userId).catch(() => {});
            }
        };

        socket.on('receive_message', handleIncomingMessage);
        return () => socket.off('receive_message', handleIncomingMessage);
    }, [socket, activeContact]);

    const filteredContacts = useMemo(() => {
        return contacts.filter(c => 
            c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [contacts, searchQuery]);

    return (
        <div className="chat-page-container">
            {/* SIDEBAR */}
            <div className={`chat-sidebar ${activeContact ? 'd-none d-md-flex' : 'w-100-mobile'}`}>
                <div className="chat-sidebar-header">
                    <InputGroup className="shadow-sm rounded-pill overflow-hidden">
                        <InputGroup.Text className="bg-light border-0"><FaSearch className="text-muted" /></InputGroup.Text>
                        <Form.Control 
                            type="text" 
                            className="chat-search-input" 
                            placeholder="Search contacts..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </InputGroup>
                </div>
                <div className="contacts-list">
                    {filteredContacts.map(contact => {
                        const online = isUserOnline(contact.userId);
                        const isActive = activeContact?.userId === contact.userId;
                        return (
                            <div 
                                key={contact.userId} 
                                className={`contact-item ${isActive ? 'active' : ''}`}
                                onClick={() => handleSelectContact(contact)}
                            >
                                <div className="position-relative">
                                    {contact.profilePicture ? (
                                        <img src={contact.profilePicture} alt="Avatar" className="contact-avatar" />
                                    ) : (
                                        <div className="user-avatar fallback m-0">{getInitials(contact.username)}</div>
                                    )}
                                    {online && <span className="online-indicator"></span>}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-meta">
                                        <span className="contact-name">{contact.username}</span>
                                        {contact.lastMessageTime && (
                                            <span className="small text-muted" style={{ fontSize: '0.65rem' }}>
                                                {formatDistanceToNow(new Date(contact.lastMessageTime), { addSuffix: true })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                        <span className="contact-role">{contact.role}</span>
                                        {contact.unreadCount > 0 && (
                                            <span className="badge-notif-count">{contact.unreadCount}</span>
                                        )}
                                    </div>
                                    {contact.lastMessage && <div className="contact-last-msg">{contact.lastMessage}</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CHAT WINDOW */}
            <div className={`chat-window ${!activeContact ? 'd-none d-md-flex' : 'w-100-mobile'}`}>
                {activeContact ? (
                    <>
                        <div className="chat-window-header">
                            <div className="d-flex align-items-center">
                                <button className="btn-back-chat d-md-none me-3" onClick={() => setActiveContact(null)} title="Back">
                                    <FaArrowLeft />
                                </button>
                                <div className="position-relative">
                                    {activeContact.profilePicture ? (
                                        <img src={activeContact.profilePicture} alt="Avatar" className="contact-avatar" />
                                    ) : (
                                        <div className="user-avatar fallback m-0">{getInitials(activeContact.username)}</div>
                                    )}
                                    {isUserOnline(activeContact.userId) && <span className="online-indicator"></span>}
                                </div>
                                <div className="ms-3">
                                    <h5 className="contact-name mb-0">{activeContact.username}</h5>
                                    <span className="contact-role">{activeContact.role}</span>
                                    <span className="small text-muted ms-2">• {isUserOnline(activeContact.userId) ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="chat-messages-container">
                            {error && <Alert variant="danger" className="m-3">{error}</Alert>}
                            {loadingHistory ? (
                                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                            ) : (
                                <>
                                    {messages.map((msg) => {
                                        const isSentByMe = msg.senderId === user.userId;
                                        const isReference = msg.content.startsWith("📌 [REFERENCE]");
                                        return (
                                            <div 
                                                key={msg.messageId} 
                                                className={`chat-bubble ${isSentByMe ? 'sent' : 'received'} ${isReference ? 'reference-bubble' : ''}`}
                                            >
                                                {isReference ? (
                                                    <div className="p-1">
                                                        <div className="fw-bold border-bottom pb-1 mb-1" style={{fontSize: '0.8rem', color: isSentByMe ? '#FFE492' : '#043873'}}>
                                                            <FaFileMedical className="me-1"/> JOBCARD REFERENCE
                                                        </div>
                                                        <div className="small" style={{whiteSpace: 'pre-line'}}>{msg.content.replace("📌 [REFERENCE] ", "")}</div>
                                                    </div>
                                                ) : (
                                                    <div className="message-content">{msg.content}</div>
                                                )}
                                                <span className="chat-bubble-time">
                                                    {format(new Date(msg.timestamp), 'hh:mm a')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* FLOATING REFERENCE BAR */}
                        {attachedJobcard && (
                            <div className="floating-reference-bar d-flex align-items-center justify-content-between p-3 border-top bg-light">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary text-white p-2 rounded-3 me-3">
                                        <FaFileMedical size={20} />
                                    </div>
                                    <div>
                                        <div className="small text-muted fw-bold" style={{fontSize: '0.65rem'}}>DISCUSSING JOBCARD #{attachedJobcard.id}</div>
                                        <div className="fw-bold text-dark">{attachedJobcard.name}</div>
                                        <Badge bg="info" className="mt-1">{attachedJobcard.status}</Badge>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button size="sm" variant="primary" onClick={handleSendReference} className="rounded-pill px-3 shadow-sm">
                                        Send Link
                                    </Button>
                                    <Button size="sm" variant="outline-secondary" className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }} onClick={() => setAttachedJobcard(null)}>
                                        <FaTimes />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Input Footer */}
                        <div className="chat-input-area">
                            <Form onSubmit={handleSendMessage}>
                                <InputGroup>
                                    <Form.Control 
                                        type="text"
                                        className="chat-input-field shadow-sm"
                                        placeholder="Type a message..."
                                        value={typedMessage}
                                        onChange={(e) => setTypedMessage(e.target.value)}
                                        disabled={loadingHistory}
                                    />
                                    <Button type="submit" variant="primary" className="rounded-circle ms-2 d-flex align-items-center justify-content-center shadow" style={{ width: '45px', height: '45px' }} disabled={!typedMessage.trim() || loadingHistory}>
                                        <FaPaperPlane />
                                    </Button>
                                </InputGroup>
                            </Form>
                        </div>
                    </>
                ) : (
                    <div className="chat-empty-state d-none d-md-flex">
                        <div className="chat-empty-icon shadow-sm">
                            <FaCommentDots />
                        </div>
                        <h4 className="fw-bold text-dark">TheDilution Secure Messenger</h4>
                        <p className="text-muted text-center max-width-md px-4">
                            Select a medical staff member from the left sidebar to start communicating.<br />
                            All communications are encrypted and logged for clinical security.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;