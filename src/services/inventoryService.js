const INVENTORY_API_URL = `${process.env.REACT_APP_API_URL}/inventory`;
const STOCK_API_URL = `${process.env.REACT_APP_API_URL}/stock`;

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

// --- INVENTORY MASTER FUNCTIONS ---

// GET all inventory master items
export const getAllInventory = async () => {
    const response = await fetch(INVENTORY_API_URL, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
};

// POST a new inventory master item
export const addInventoryMaster = async (masterData) => {
    const response = await fetch(INVENTORY_API_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(masterData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add inventory master');
    }
    return response.json();
};

// DELETE an inventory master item
export const deleteInventoryMaster = async (inventoryId) => {
    const response = await fetch(`${INVENTORY_API_URL}/${inventoryId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete inventory master');
    }
    return response.json();
};


// --- INVENTORY STOCK BATCH FUNCTIONS ---

// POST a new stock batch to an existing master
export const addStockBatch = async (inventoryId, stockData) => {
    const response = await fetch(`${INVENTORY_API_URL}/${inventoryId}/stock`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(stockData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add stock batch');
    }
    return response.json();
};

// PUT (update) an existing stock batch
export const updateStockBatch = async (stockId, stockData) => {
    const response = await fetch(`${STOCK_API_URL}/${stockId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(stockData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update stock batch');
    }
    return response.json();
};

// DELETE an existing stock batch
export const deleteStockBatch = async (stockId) => {
    const response = await fetch(`${STOCK_API_URL}/${stockId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete stock batch');
        } else {
            throw new Error(`Server responded with an error: ${response.status} ${response.statusText}`);
        }
    }
    return response.json();
};