const API_URL = 'https://advantech.thedilution.my/api/notifications';

// Helper function to get the auth token from localStorage
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { 
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        };
    }
    return {};
};

// GET all notifications for the logged-in user
export const getMyNotifications = async () => {
    const response = await fetch(`${API_URL}/mine`, {
        method: 'GET',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notifications');
    }
    return response.json();
};

// PUT (update) a notification to mark it as read
export const markNotificationAsRead = async (notificationId) => {
    const response = await fetch(`${API_URL}/read/${notificationId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        // The API expects an isRead body, even if it's just to set it to true
        body: JSON.stringify({ isRead: true })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update notification');
    }
    return response.json();
};