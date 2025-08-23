import { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case "LOGOUT":
      localStorage.removeItem("token");
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "LOAD_USER":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set axios default header
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/me`
      );
      dispatch({ type: "LOAD_USER", payload: response.data.user });
    } catch (error) {
      console.error("Load user error:", error);
      dispatch({ type: "LOGOUT" });
    }
  };

  const login = async (email, password) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          token: response.data.token,
          user: response.data.user,
        },
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role = "customer") => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name,
          email,
          password,
          role,
        }
      );

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          token: response.data.token,
          user: response.data.user,
        },
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, message };
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        userData
      );
      dispatch({ type: "LOAD_USER", payload: response.data.user });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed";
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        clearError: () => dispatch({ type: "CLEAR_ERROR" }),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
