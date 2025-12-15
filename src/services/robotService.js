const API_URL = process.env.REACT_APP_ROBOT_API_URL;

/**
 * Fetches the latest task logs from the robot's PHP API.
 * It uses 'no-store' to ensure the data is always fresh, preventing caching.
 * @returns {Promise<Array>} A promise that resolves with an array of log objects.
 */
export const fetchTaskLogs = async () => {
    // The { cache: 'no-store' } part is crucial for polling fresh data.
    const response = await fetch(`${API_URL}/fetch_log.php`, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch robot task logs. The API may be down.');
    }
    return response.json();
};

/**
 * Triggers a new task on the robot's PHP API.
 * @param {string} taskName - The name of the task (e.g., 'Dilution Process').
 * @param {string} [message=''] - An optional message or command string for the task.
 * @returns {Promise<object>} A promise that resolves with the server's JSON response.
 */
export const triggerTask = async (taskName, message = '') => {
    // The PHP script expects 'application/x-www-form-urlencoded', so we build the body this way.
    const body = new URLSearchParams();
    body.append('task_name', taskName);
    body.append('message', message);

    const response = await fetch(`${API_URL}/trigger.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to trigger task. Server responded with: ${errorText}`);
    }
    return response.json(); // Assuming the PHP script now returns JSON
};