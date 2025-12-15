const API_URL = process.env.REACT_APP_JETSON_API_URL;

// --- STATE MANAGEMENT ---
export const startRegistrationMode = () => fetch(`${API_URL}/start_registration`, { method: 'POST' });
export const startVerificationMode = () => fetch(`${API_URL}/start_verification`, { method: 'POST' });

// --- VIDEO FEED ---
// Returns the URL for the video stream iframe, adding a timestamp to prevent caching.
export const getVideoFeedUrl = () => `${API_URL}/video_feed?t=${Date.now()}`;

// --- REGISTRATION ACTIONS ---
export const registerFace = async (name) => {
    const response = await fetch(`${API_URL}/snap_face`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    return response.json();
};

// --- USER MANAGEMENT ---
export const getRegisteredUsers = async () => {
    const response = await fetch(`${API_URL}/get_users`);
    if (!response.ok) throw new Error('Failed to fetch registered users.');
    return response.json();
};

export const deleteUser = async (name) => {
    const response = await fetch(`${API_URL}/delete_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    return response.json();
};

// --- VERIFICATION POLLING ---
export const checkVerificationStatus = async () => {
    const response = await fetch(`${API_URL}/check_verification`);
    if (!response.ok) throw new Error('Verification check failed.');
    return response.json();
};