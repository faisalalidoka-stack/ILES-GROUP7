// src/services/api.js
const BASE_URL = "http://127.0.0.1:8000";

//the token helpers first

/*this is a memory manager for the front end when someone logs in their token is kept in local storage 
to keep them logged in and when they log out their token is removed and all their information is cleared */
export const saveToken = (token) => localStorage.setItem("iles_token", token);
export const getToken = () => localStorage.getItem("iles_token");
export const saveUser = (user) => localStorage.setItem("iles_user", JSON.stringify(user));
export const getUser = () => JSON.parse(localStorage.getItem("iles_user")) || null;
export const logOut = () => {localStorage.removeItem("iles_token"); localStorage.removeItem("iles_user")};


//now for the core fetch wrapper
// this automatically adds the token to the header of every request if it exists 
// and also handles the response and retuns a parsed json object or throws an error if the response is not ok
async function apiFetch(path, options = {}) {
    const token = getToken();
    const { skipAuth, ...fetchOptions } = options;
    const headers = {
        "Content-Type": "application/json",
        //i first suffered with this
        //because i aws attaching the token to the header of login request which was causing failure 
        //so i needed to add skipAuth option to allow a login request to be sent without first checjikng for a token 
        //and for the requests where the token exists it will be attached for authentication
        ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
    };
    const response = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });

    let data = null;
    try {
        data = await response.json();
    } catch {
        // non-JSON response (e.g., HTML error page)
    }

    if (!response.ok) {
        throw new Error(
            data?.message || data?.error || `Request failed (${response.status})`
        );
    }
    return data; 

}

// now the authentiaction functions
export async function loginUser({email, password, role}) {
  return apiFetch('/login/',{
    method: 'POST',
    body: JSON.stringify({email, password, role}),
    skipAuth: true, // don't attach a possibly-expired token to login
  });
}

//now the plcements
export const getPlacements = () => apiFetch('/placements/');
export const getPlacement = (id) => apiFetch(`/placements/${id}/`);
export const createPlacement = (data) => apiFetch('/placements/', {
    method: 'POST', body: JSON.stringify(data)});

export const updatePlacement = (id, data) => apiFetch(`/placements/${id}/`, {
    method: 'PATCH', body: JSON.stringify(data)});

//Weekly Logs
export const getWeeklyLogs = () => apiFetch('/logs/'); 
export const getWeeklyLog = (id) => apiFetch(`/logs/${id}/`);
export const createWeeklyLog = (data) => apiFetch('/logs/', {
    method: 'POST', body: JSON.stringify(data)});
export const updateWeeklyLog = (id, data) => apiFetch(`/logs/${id}/`, {
    method: 'PATCH', body: JSON.stringify(data)});
    
//now eavluations
export const getEvaluations = () => apiFetch('/evaluations/');
export const getEvaluation = (id) => apiFetch(`/evaluations/${id}/`);
export const createEvaluation = (data) => apiFetch('/evaluations/', {
    method: 'POST', body: JSON.stringify(data)});


//grades now
export const getGrades = () => apiFetch('/grades/');

export async function registerUser({ username, email, password, confirmPassword, role}) {
    return apiFetch("/register/", {
    method: "POST",
    body: JSON.stringify({ username, email, password,
      confirm_password: confirmPassword, role }),
  });
}

export async function forgotPassword({ email, newPassword, confirmPassword }) {
  return apiFetch("/forgot-password/", {
    method: "POST",
    body: JSON.stringify({ email,
      new_password: newPassword,
      confirm_password: confirmPassword }),
  });
}
 



    
    


    
