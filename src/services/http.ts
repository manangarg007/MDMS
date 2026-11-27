import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Shared Axios instance configured with the API base URL.
 * Feature services should import this client instead of calling Axios in JSX.
 */
export const http = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default http;
