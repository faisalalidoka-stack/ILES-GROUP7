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
    const headers = {
        "Content-Type": "application/json",
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
        ...options.headers,
    };
    const response = await fetch(`${BASE_URL}${path}`, {...options, headers});
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || "The request failed");
    return data; 

}

// now the authentiaction functions
export async function loginUser({email, password}) {
  return apiFetch('/login/',{
    method: 'POST',
    body: JSON.stringify({email, password}),
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


    
    


    
