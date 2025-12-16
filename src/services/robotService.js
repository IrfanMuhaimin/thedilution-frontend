const API_URL = process.env.REACT_APP_ROBOT_API_URL;

/**
 * Fetches the latest task logs from the robot's fetch_log.php API.
 */
export const fetchTaskLogs = async () => {
    const response = await fetch(`${API_URL}/fetch_log.php`, { cache: 'no-store' });
    if (!response.ok) {
        // This will now correctly throw the <!DOCTYPE error if fetch_log.php crashes
        throw new Error('Failed to fetch robot task logs. The API may be down or misconfigured.');
    }
    return response.json(); // This expects JSON
};

/**
 * Triggers a new task on the robot's trigger.php API.
 * This version is more robust and can handle both text and JSON responses.
 */
export const triggerTask = async (taskName) => {
    const body = new URLSearchParams();
    body.append('task', taskName);

    const response = await fetch(`${API_URL}/trigger.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to trigger task. Server responded with: ${errorText}`);
    }

    // --- THIS IS THE ROBUST FIX ---
    // We get the raw text first.
    const responseText = await response.text();

    // Try to parse it as JSON (for future-proofing if your friend fixes it).
    try {
        const jsonResponse = JSON.parse(responseText);
        // If it's JSON and has a log_id, return that.
        if (jsonResponse && jsonResponse.log_id) {
            return jsonResponse.log_id.toString();
        }
    } catch (e) {
        // If it's not JSON, it's likely the plain text ID.
        // We just return the text directly.
        return responseText;
    }
    
    // Fallback in case the JSON was valid but didn't contain what we expected.
    return responseText;
};