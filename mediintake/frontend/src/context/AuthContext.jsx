import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // LOGIN
  const login = useCallback(async (email, password) => {
    setError(null);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);

      return user;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to login";

      setError(message);
      throw new Error(message);
    }
  }, []);

  // REGISTER
  const register = useCallback(async (data) => {
    setError(null);

    try {
      const res = await api.post("/auth/register", data);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Registration failed";

      setError(message);
      throw new Error(message);
    }
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};