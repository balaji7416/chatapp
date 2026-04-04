import axios from "axios";
import { useAuthStore } from "../store/authStore.js";
import { useSocketStore } from "../store/socketStore.js";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
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

//for auto refresh on token expiry
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original_request = err.config;

    if (err.response?.status === 401 && !original_request._retry) {
      original_request._retry = true;

      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          {
            withCredentials: true,
          },
        );
        console.log("token refreshed", res.data.data);
        const new_access_token = res.data.data.access_token;
        const new_refresh_token = res.data.data.refresh_token;

        const { user, setLoginState } = useAuthStore.getState();

        setLoginState({
          user,
          access_token: new_access_token,
          refresh_token: new_refresh_token,
          isAuthenticated: true,
        });
        // await useSocketStore.getState().forceReconnect();
        original_request.headers.Authorization = `Bearer ${new_access_token}`;
        return api(original_request);
      } catch (e) {
        useAuthStore.getState().logout();
        useSocketStore.getState().disconnect();
        return Promise.reject(e);
      }
    }
    return Promise.reject(err);
  },
);
export default api;
