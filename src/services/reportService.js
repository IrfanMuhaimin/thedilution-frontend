const API_URL = process.env.REACT_APP_API_URL;

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

// GET all generated reports
export const getAllReports = async () => {
    const response = await fetch(`${API_URL}/reports`, {
        method: 'GET',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reports');
    }
    return response.json();
};

// POST to generate a new report
export const generateReport = async (reportData) => {
    const response = await fetch(`${API_URL}/reports/generate`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(reportData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
    }
    return response.json();
};

// --- START: NEW FUNCTION TO ADD ---
/**
 * Downloads a specific report as a PDF blob.
 * @param {number} reportId - The ID of the report to download.
 * @returns {Promise<Blob>} A Promise that resolves with the PDF file blob.
 */
export const downloadReportPdf = async (reportId) => {
    // Note: We create a separate header object here because we don't want to send
    // 'Content-Type': 'application/json' when requesting a file.
    const authHeader = getAuthHeader();
    delete authHeader['Content-Type']; // Remove content type for file download

    const response = await fetch(`${API_URL}/reports/${reportId}/pdf`, {
        method: 'GET',
        headers: authHeader
    });

    if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to download the report.');
        } catch (e) {
            throw new Error(`Failed to download the report. Server responded with status ${response.status}`);
        }
    }
    return response.blob();
};
// --- END: NEW FUNCTION TO ADD ---

// DELETE a report
export const deleteReport = async (reportId) => {
    const response = await fetch(`${API_URL}/reports/${reportId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete report');
    }
    return response.json();
};