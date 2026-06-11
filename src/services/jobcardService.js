// src/services/jobcardService.js
const API_URL = `${process.env.REACT_APP_API_URL}/jobcards`;

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.token ? { 
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
    } : {};
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

export const addJobcard = async (jobcardData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(jobcardData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Server Error" }));
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

// Add these to src/services/jobcardService.js

export const archiveJobcard = async (jobcardId) => {
    const response = await fetch(`${API_URL}/${jobcardId}/archive`, {
        method: 'PUT',
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to archive job card');
    return response.json();
};

export const getArchivedJobcards = async () => {
    const response = await fetch(`${API_URL}/archived/list`, {
        method: 'GET',
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch archived job cards');
    return response.json();
};
export const permanentDeleteJobcard = async (jobcardId) => {
    const response = await fetch(`${API_URL}/${jobcardId}/permanent`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to permanently delete Jobcard');
    }
    return response.json();
};