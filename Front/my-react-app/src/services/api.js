
const BASE_URL = "http://127.0.0.1:8000";

// --- Token & User Helpers ---
export const saveToken = (token) => localStorage.setItem("iles_token", token);
export const getToken = () => localStorage.getItem("iles_token");
export const saveUser = (user) => localStorage.setItem("iles_user", JSON.stringify(user));
export const getUser = () => JSON.parse(localStorage.getItem("iles_user")) || null;
export const logOut = () => {
    localStorage.removeItem("iles_token");
    localStorage.removeItem("iles_user");
};

// --- Core Fetch Wrapper ---
async function apiFetch(path, options = {}) {
    const token = getToken();
    const { skipAuth, ...fetchOptions } = options;
    const headers = {
        "Content-Type": "application/json",
        ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
    };
    
    const response = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });

    let data = null;
    try {
        data = await response.json();
    } catch {
        // Handle non-JSON response
    }

    if (!response.ok) {
        throw new Error(
            data?.message || data?.error || `Request failed (${response.status})`
        );
    }
    return data;
}

// --- Authentication Functions ---
export async function loginUser({ email, password, role }) {
    return apiFetch('/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
        skipAuth: true,
    });
}

export async function registerUser({ username, email, password, confirmPassword, role }) {
    return apiFetch("/register/", {
        method: "POST",
        body: JSON.stringify({
            username,
            email,
            password,
            confirm_password: confirmPassword,
            role,
        }),
    });

}



//i have split the forgot password functionality into two steps to match the backend implementation
export async function requestPasswordReset({ email }) {
    return apiFetch("/auth/password-reset-request/", {
        method: "POST",
        body: JSON.stringify({ email }),
        skipAuth: true, 
    });
}
//this is the second step where the user submits the new password along with the uid and token they received in their email
export async function confirmPasswordReset({ uid, token, newPassword, confirmPassword }) {
    return apiFetch("/auth/password-reset-confirm/", {
        method: "POST",
        body: JSON.stringify({ 
            uid, 
            token, 
            new_password: newPassword, 
            confirm_password: confirmPassword 
        }),
        skipAuth: true, 
    });
}

// --- Placements ---
export const getPlacements = () => apiFetch('/placements/');
export const getPlacement = (id) => apiFetch(`/placements/${id}/`);
export const createPlacement = (data) => apiFetch('/placements/', {
    method: 'POST', 
    body: JSON.stringify(data)
});
export const updatePlacement = (id, data) => apiFetch(`/placements/${id}/`, {
    method: 'PATCH', 
    body: JSON.stringify(data)
});

// --- Weekly Logs ---
export const getWeeklyLogs = () => apiFetch('/logs/');
export const getWeeklyLog = (id) => apiFetch(`/logs/${id}/`);
export const createWeeklyLog = (data) => apiFetch('/logs/', {
    method: 'POST', 
    body: JSON.stringify(data)
});
export const updateWeeklyLog = (id, data) => apiFetch(`/logs/${id}/`, {
    method: 'PATCH', 
    body: JSON.stringify(data)
});

// --- Evaluations ---
export const getEvaluations = () => apiFetch('/evaluations/');
export const getEvaluation = (id) => apiFetch(`/evaluations/${id}/`);
export const createEvaluation = (data) => apiFetch('/evaluations/', {
    method: 'POST', 
    body: JSON.stringify(data)
});

// --- Grades ---
export const getGrades = () => apiFetch('/grades/');