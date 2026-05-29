import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true,
});

export const adminApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`,
  withCredentials: true,
});

export const userApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/user`,
  withCredentials: true,
});

const attachAuthHeader = (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
};

api.interceptors.request.use(attachAuthHeader);
adminApi.interceptors.request.use(attachAuthHeader);
userApi.interceptors.request.use(attachAuthHeader);

const attachUnauthorizedRedirect = (
  error: unknown,
  loginPath: string,
  isLoginPath: (pathname: string) => boolean,
) => {
  const status = (error as { response?: { status?: number } })?.response?.status;

  if (typeof window !== "undefined" && status === 401) {
    useAuthStore.getState().clearSession();
    if (!isLoginPath(window.location.pathname)) {
      window.location.href = loginPath;
    }
  }

  return Promise.reject(error);
};

adminApi.interceptors.response.use(
  (response) => response,
  (error) =>
    attachUnauthorizedRedirect(error, "/admin/login", (pathname) => pathname.startsWith("/admin/login")),
);

userApi.interceptors.response.use(
  (response) => response,
  (error) => attachUnauthorizedRedirect(error, "/login", (pathname) => pathname.startsWith("/login")),
);

