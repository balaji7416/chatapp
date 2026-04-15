import axios from "axios";
import { useAuthStore } from "../store/authStore.js";
import { useSocketStore } from "../store/socketStore.js";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true, //for cookies
});

//for auto token attachment on every request
api.interceptors.request.use(
  (config) => {
    const access_token = useAuthStore.getState().access_token;
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

let isRefreshing = false;
let queue = [];

const processQueue = (token, error) => {
  queue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  queue = [];
};

//for auto refresh on token expiry
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original_request = err.config;

    //if refresh endpoint itself fails, logout
    if (original_request.url?.includes("/auth/refresh")) {
      console.log(`Refresh endpoint failed, logging out`);
      useAuthStore.getState().logout();
      useSocketStore.getState().disconnect();
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !original_request._retry) {
      original_request._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then((token) => {
            original_request.headers.Authorization = `Bearer ${token}`;
            return api(original_request);
          })
          .catch((err) => Promise.reject(err));
      }

      original_request._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          {
            withCredentials: true,
          },
        );
        //console.log("token refreshed", res.data.data);
        const new_access_token = res.data.data.access_token;
        const new_refresh_token = res.data.data.refresh_token;

        const { user, setLoginState } = useAuthStore.getState();

        setLoginState({
          user,
          access_token: new_access_token,
          refresh_token: new_refresh_token,
          isAuthenticated: true,
        });

        processQueue(new_access_token, null);
        //useSocketStore.getState().forceReconnect();
        original_request.headers.Authorization = `Bearer ${new_access_token}`;
        return api(original_request);
      } catch (e) {
        useAuthStore.getState().logout();
        useSocketStore.getState().disconnect();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  },
);
export default api;
