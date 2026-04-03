import API from "../services/api";

export const isAuthenticated = async () => {
  try {
    await API.get("/interview/my"); // protected route test
    return true;
  } catch {
    return false;
  }
};