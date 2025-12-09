const API_URL = `${process.env.REACT_APP_API_URL}/dashboard`;
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
// GET dashboard data, with a parameter for the time filter
export const getDashboardData = async (days = 7) => { // Default to 7 days
const response = await fetch(`${API_URL}?days=${days}`, {
method: 'GET',
headers: getAuthHeader()
});
if (!response.ok) {
throw new Error('Failed to fetch dashboard data');
}
return response.json();
};