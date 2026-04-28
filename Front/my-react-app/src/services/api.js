const BASE_URL = "http://127.0.0.1:8000";

// --- Token & User Helpers ---
export const saveToken = (token) => localStorage.setItem("iles_token", token);
export const getToken = () => localStorage.getItem("iles_token");
export const saveUser = (user) => localStorage.setItem("iles_user", JSON.stringify(user));
export const getUser = () => JSON.parse(localStorage.getItem("iles_user")) || null;
export const logOut = () => {
    localStorage.removeItem("iles_token");
    localStorage.removeItem("iles_user");
    localStorage.removeItem("iles_refresh");
};

// --- Core Fetch Wrapper ---
async function apiFetch(path, options = {}, isRetry = false) {
    const token = getToken();
    const { skipAuth, ...fetchOptions } = options;
    
    // FIX 1: Don't set JSON headers if we are sending a file (FormData)
    // Browsers must set their own boundary for file uploads to work
    const headers = {
        ...(fetchOptions.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
    };

    const response = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });

    if (response.status === 401 && !isRetry && !skipAuth) {
        const refreshToken = localStorage.getItem("iles_refresh");
        if (refreshToken) {
            try {
                const refreshResponse = await fetch(`${BASE_URL}/token/refresh/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: refreshToken }),
                });
                if (refreshResponse.ok) {
                    const { access } = await refreshResponse.json();
                    saveToken(access);
                    return apiFetch(path, options, true);
                }
            } catch (err) {
                console.error("Token refresh failed", err);
            }
        }
        logOut();
        window.location.href = "/";
        throw new Error("Session expired. Please log in again.");
    }

    let data = null;
    try { data = await response.json(); } catch { }

    if (!response.ok) {
        // FIX 2: Log the actual backend error (like "placement field required")
        console.error("Backend Error Detail:", data);
        throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
    }
    return data;
}

// --- Authentication ---
export async function loginUser({ email, password, role }) {
    const data = await apiFetch('/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
        skipAuth: true,
    });
    if (data && data.refresh_token) localStorage.setItem('iles_refresh', data.refresh_token);
    return data;
}

export async function registerUser({ username, email, password, confirmPassword, role }) {
    return apiFetch("/register/", {
        method: "POST",
        body: JSON.stringify({ username, email, password, confirm_password: confirmPassword, role }),
        skipAuth: true,
    });
}

export async function requestPasswordReset({ email }) {
    return apiFetch("/auth/password-reset-request/", { method: "POST", body: JSON.stringify({ email }), skipAuth: true });
}

export async function confirmPasswordReset({ uid, token, newPassword, confirmPassword }) {
    return apiFetch("/auth/password-reset-confirm/", {
        method: "POST",
        body: JSON.stringify({ uid, token, new_password: newPassword, confirm_password: confirmPassword }),
        skipAuth: true,
    });
}

// --- Placements ---
export const getPlacements = () => apiFetch('/placements/');
export const getPlacement = (id) => apiFetch(`/placements/${id}/`);
export const createPlacement = (data) => apiFetch('/placements/', { method: 'POST', body: JSON.stringify(data) });
export const updatePlacement = (id, data) => apiFetch(`/placements/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });

// --- Weekly Logs ---
export const getWeeklyLogs = () => apiFetch('/logs/');
export const getWeeklyLog = (id) => apiFetch(`/logs/${id}/`);

// FIX 3: Automatically handle attachments without changing your Dashboard logic
export const createWeeklyLog = (data) => {
    if (data.attachment) {
        const formData = new FormData();
        Object.keys(data).forEach(key => formData.append(key, data[key]));
        return apiFetch('/logs/', { method: 'POST', body: formData });
    }
    return apiFetch('/logs/', { method: 'POST', body: JSON.stringify(data) });
};

export const updateWeeklyLog = (id, data) => apiFetch(`/logs/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });

// --- Evaluations & Grades ---
export const getEvaluations = () => apiFetch('/evaluations/');
export const getEvaluation = (id) => apiFetch(`/evaluations/${id}/`);
export const createEvaluation = (data) => apiFetch('/evaluations/', { method: 'POST', body: JSON.stringify(data) });
export const getGrades = () => apiFetch('/grades/');


// --- Grades (create final grade) ---
export const createGrade = (data) => apiFetch('/grades/create/', {
    method: 'POST',
    body: JSON.stringify(data)
});

// --- Evaluations (update existing) ---
export const updateEvaluation = (id, data) => apiFetch(`/evaluations/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data)
});

// --- Notifications ---
export const getNotifications = () => apiFetch('/notifications/');
export const markNotificationRead = (id) => apiFetch(`/notifications/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_read: true })
});

// --- Flags ---
export const createFlag = (data) => apiFetch('/flags/', {
    method: 'POST',
    body: JSON.stringify(data)
});