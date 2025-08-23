import axios from "axios";

// Backend Base URL (adjust if backend runs on another port)
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add JWT token if logged in
API.interceptors.request.use((req) => {
  const auth = JSON.parse(localStorage.getItem("auth"));
  if (auth?.token) {
    req.headers.Authorization = `Bearer ${auth.token}`;
  }
  return req;
});

export default API;
