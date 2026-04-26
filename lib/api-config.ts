// Central API configuration for the frontend
// Use this to easily switch between localhost and production

export const API_BASE_URL = "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        FARMER_LOGIN: `${API_BASE_URL}/api/auth/farmer-login`,
        GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google-login`,
        GOOGLE_SIGNUP: `${API_BASE_URL}/api/auth/google-signup`,
        ME: `${API_BASE_URL}/api/auth/me`,
    },
    // Farmers
    FARMERS: {
        BASE: `${API_BASE_URL}/api/farmers`,
        PROFILE: `${API_BASE_URL}/api/farmers/profile`,
        STATS: (id: string) => `${API_BASE_URL}/api/farmers/${id}/stats`,
    },
    // Dhalaris
    DHALARIS: {
        BASE: `${API_BASE_URL}/api/dhalaris`,
        BY_ID: (id: string) => `${API_BASE_URL}/api/dhalaris/${id}`,
        ANALYTICS: (id: string) => `${API_BASE_URL}/api/dhalaris/${id}/analytics`,
    },
    // Crops
    CROPS: {
        BASE: `${API_BASE_URL}/api/crops`,
        BY_FARMER: (id: string) => `${API_BASE_URL}/api/crops/farmer/${id}`,
        BY_ID: (id: string) => `${API_BASE_URL}/api/crops/${id}`,
        PREDICTIONS: `${API_BASE_URL}/api/crops/predictions`,
    },
    // Trader Requests
    TRADER_REQUESTS: {
        BASE: `${API_BASE_URL}/api/trader-requests`,
        BY_ID: (id: string) => `${API_BASE_URL}/api/trader-requests/${id}`,
        BY_FARMER: (id: string) => `${API_BASE_URL}/api/trader-requests/farmer/${id}`,
        BY_DHALARI: (id: string) => `${API_BASE_URL}/api/trader-requests/dhalari/${id}`,
    },
    // Market Prices
    MARKET_PRICES: {
        BASE: `${API_BASE_URL}/api/market-prices`,
        BY_CROP: (crop: string) => `${API_BASE_URL}/api/market-prices/${crop}`,
    },
    // Notifications
    NOTIFICATIONS: {
        BASE: `${API_BASE_URL}/api/notifications`,
        BY_USER: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
        COUNT: (id: string) => `${API_BASE_URL}/api/notifications/count/${id}`,
        READ: (id: string) => `${API_BASE_URL}/api/notifications/${id}/read`,
        MARK_ALL_READ: (id: string) => `${API_BASE_URL}/api/notifications/mark-all-read/${id}`,
        CONTACT_SUBMIT: `${API_BASE_URL}/api/notifications/contact/submit`,
    },
};

export default API_ENDPOINTS;
