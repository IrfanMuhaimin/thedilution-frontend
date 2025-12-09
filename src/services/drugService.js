//services/drugService.js
const BASE_URL = 'https://advantech.thedilution.my/api';

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

// --- Prescription API Calls ---

export const getAllPrescriptions = async () => {
    const response = await fetch(`${BASE_URL}/prescriptions`, { headers: getAuthHeader() });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch prescriptions');
    }
    return response.json();
};

export const addPrescription = async (prescriptionData) => {
    const response = await fetch(`${BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(prescriptionData)
    });
    // THIS IS THE CRITICAL PART FOR ERROR HANDLING
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add prescription');
    }
    return response.json();
};

export const updatePrescription = async (id, prescriptionData) => {
    const response = await fetch(`${BASE_URL}/prescriptions/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(prescriptionData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update prescription');
    }
    return response.json();
};

export const deletePrescription = async (id) => {
    const response = await fetch(`${BASE_URL}/prescriptions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete prescription');
    }
    return response.json();
};

// --- Formula API Calls ---

export const getAllFormulas = async () => {
    const response = await fetch(`${BASE_URL}/formulas`, { headers: getAuthHeader() });
    
    if (!response.ok) {
        let errorMessage = 'Failed to fetch formulas';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
    return response.json();
};

export const addFormula = async (data) => {
    const response = await fetch(`${BASE_URL}/formulas`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add formula');
    }
    return response.json();
};

export const updateFormula = async (id, data) => {
    const response = await fetch(`${BASE_URL}/formulas/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update formula');
    return response.json();
};

export const deleteFormula = async (id) => {
    const response = await fetch(`${BASE_URL}/formulas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to delete formula');
    return response.json();
};

// --- Dilution API Calls ---

export const getAllDilutions = async () => {
    const response = await fetch(`${BASE_URL}/dilutions`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch dilutions');
    return response.json();
};

export const addDilution = async (data) => {
    const response = await fetch(`${BASE_URL}/dilutions`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add dilution');
    return response.json();
};

export const updateDilution = async (id, data) => {
    const response = await fetch(`${BASE_URL}/dilutions/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update dilution');
    return response.json();
};

export const deleteDilution = async (id) => {
    const response = await fetch(`${BASE_URL}/dilutions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to delete dilution');
    return response.json();
};