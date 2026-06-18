import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

/** Convert a backend-relative file URL to an absolute, viewable URL. */
export function resolveImageUrl(url) {
  if (!url) return url;
  if (url.startsWith("/api/")) return `${BACKEND_URL}${url}`;
  return url;
}

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("inai_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      const path = window.location.pathname;
      if (path.startsWith("/admin") && path !== "/admin/login") {
        localStorage.removeItem("inai_token");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
