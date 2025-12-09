const API_URL = `${process.env.REACT_APP_API_URL}/consumptions`;

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

// GET all consumption records
export const getAllConsumptions = async () => {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch consumptions');
    }
    return response.json();
};

// NOTE: Your API documentation did not include an endpoint for adding a new consumption.
// This is a placeholder and will need a correct POST endpoint to function.
// For now, it will show an alert if used.
export const addConsumption = async (consumptionData) => {
    alert('Feature in development: The API endpoint for adding consumptions is not yet available.');
    // When the API is ready, the code would look like this:
    /*
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(consumptionData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add consumption');
    }
    return response.json();
    */
    return Promise.resolve(); // Prevents crashing
};

// PUT (update) a consumption record
export const updateConsumption = async (consumptionId, consumptionData) => {
    const response = await fetch(`${API_URL}/${consumptionId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(consumptionData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update consumption');
    }
    return response.json();
};

// DELETE a consumption record
export const deleteConsumption = async (consumptionId) => {
    const response = await fetch(`${API_URL}/${consumptionId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete consumption');
    }
    return response.json();
};