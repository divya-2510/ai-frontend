const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true,
});