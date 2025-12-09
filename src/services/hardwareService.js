//services/hardwareService.js

const API_URL = `${process.env.REACT_APP_API_URL}/hardware`;

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

// GET all hardware
export const getAllHardware = async () => {
    const headers = getAuthHeader();
    console.log('Headers being sent for Hardware API:', headers);
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch hardware');
    }
    return response.json();
};

// POST a new hardware item
export const addHardware = async (hardwareData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(hardwareData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add hardware');
    }
    return response.json();
};

// PUT (update) a hardware item
export const updateHardware = async (hardwareId, hardwareData) => {
    const response = await fetch(`${API_URL}/${hardwareId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(hardwareData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update hardware');
    }
    return response.json();
};

// DELETE a hardware item
export const deleteHardware = async (hardwareId) => {
    const response = await fetch(`${API_URL}/${hardwareId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete hardware');
    }
    return response.json();
};