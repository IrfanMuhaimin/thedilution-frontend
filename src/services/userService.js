//services/userService.js
const API_URL = `${process.env.REACT_APP_API_URL}/users`;

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

// GET all users
export const getAllUsers = async () => {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return response.json();
};

// POST a new user
export const addUser = async (userData) => {
    // Note: The API spec error message mentions password, so we include it.
    // The spec for the body seems to have omitted it, which is common.
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
    }
    return response.json();
};

// PUT (update) a user
export const updateUser = async (userId, userData) => {
    const response = await fetch(`${API_URL}/${userId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        throw new Error('Failed to update user');
    }
    return response.json();
};

// DELETE a user
export const deleteUser = async (userId) => {
    const response = await fetch(`${API_URL}/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        throw new Error('Failed to delete user');
    }
    return response.json();
};

// GET My Profile
export const getMyProfile = async () => {
    const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch profile');
    }
    return response.json();
};

// PUT (update) My Profile
export const updateMyProfile = async (profileData) => {
    const response = await fetch(`${API_URL}/me`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(profileData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
    }
    return response.json();
};