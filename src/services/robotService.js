// src/services/robotService.js
const API_URL = `${process.env.REACT_APP_API_URL}`;

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.token ? { 
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
    } : {};
};

/**
 * Fetches the latest task logs from your Express database
 */
export const fetchTaskLogs = async (hardwareId) => {
    // We fetch logs using your Express API, completely eliminating remote CORS blocks
    const response = await fetch(`${API_URL}/logs/hardware/${hardwareId}`, { 
        method: 'GET',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch robot task logs.');
    }
    return response.json(); 
};

/**
 * Triggers a manual diagnostic run through your Express API Gateway Proxy
 */
export const triggerTask = async (taskName, hardwareId) => {
    const response = await fetch(`${API_URL}/hardware/${hardwareId}/trigger`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ taskName })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to trigger task.');
    }
    
    return response.text(); // Returns the raw Task ID (e.g. 888)
};