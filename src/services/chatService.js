// src/services/chatService.js
const API_URL = `${process.env.REACT_APP_API_URL}/chat`;

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.token ? { 
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
    } : {};
};

export const getContacts = async () => {
    const response = await fetch(`${API_URL}/contacts`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch contacts');
    return response.json();
};

export const getConversation = async (contactId) => {
    const response = await fetch(`${API_URL}/conversation/${contactId}`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch conversation');
    return response.json();
};