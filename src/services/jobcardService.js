const API_URL = `${process.env.REACT_APP_API_URL}/jobcards`;

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

// GET all job cards
export const getAllJobcards = async () => {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch job cards');
    }
    return response.json();
};

// POST a new job card
export const addJobcard = async (jobcardData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(jobcardData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add job card');
    }
    return response.json();
};

// PUT (update) a job card
export const updateJobcard = async (jobcardId, jobcardData) => {
    const response = await fetch(`${API_URL}/${jobcardId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(jobcardData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update job card');
    }
    return response.json();
};

// DELETE a job card
export const deleteJobcard = async (jobcardId) => {
    const response = await fetch(`${API_URL}/${jobcardId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete job card');
    }
    return response.json();
};

// --- THIS IS THE MISSING FUNCTION ---
/**
 * Calls the backend to execute an approved jobcard.
 * @param {number} jobcardId - The ID of the jobcard to execute.
 * @returns {Promise<object>} A promise that resolves with the success message from the server.
 */
export const executeJobcard = async (jobcardId) => {
    const response = await fetch(`${API_URL}/${jobcardId}/execute`, {
        method: 'POST',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to execute job card');
    }
    return response.json();
};