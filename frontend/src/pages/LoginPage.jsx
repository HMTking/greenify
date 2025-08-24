import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Clear any previous error only when component unmounts or route changes
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data) => {
    // Clear previous messages
    setMessage("");
    setLocalError("");

    const result = await login(data.email, data.password);
    if (result.success) {
      setMessage("Login successful!");
      setTimeout(() => navigate("/"), 1000);
    } else {
      // Set local error if login fails
      setLocalError(
        result.message ||
          error ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div
      className="container"
      style={{ maxWidth: "400px", margin: "4rem auto" }}
    >
      <div className="card">
        <div className="card-header text-center">
          <h2>Login to Your Account</h2>
        </div>

        <div className="card-body">
          {(error || localError) && (
            <div className="alert alert-error">{localError || error}</div>
          )}
          {message && <div className="alert alert-success">{message}</div>}

          <div
            style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #0ea5e9",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#0369a1" }}>
              Test Login Credentials
            </h4>
            <div style={{ fontSize: "0.875rem", color: "#0369a1" }}>
              <div style={{ marginBottom: "0.75rem" }}>
                <strong>🔧 Admin Account:</strong>
                <br />
                Email: admin@gmail.com
                <br />
                Password: AdminPlant@123
              </div>
              <div>
                <strong>👤 Customer Account:</strong>
                <br />
                Email: customer@gmail.com
                <br />
                Password: PlantLover@456
              </div>
            </div>
            <p
              style={{
                margin: "0.75rem 0 0 0",
                fontSize: "0.75rem",
                color: "#0369a1",
                fontStyle: "italic",
              }}
            >
              Note: You can also create your own account via registration
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                {...register("email", {
                  required: "Email is required",
                  minLength: {
                    value: 5,
                    message: "Email must be at least 5 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Enter a valid email address",
                  },
                })}
                placeholder="Enter your email"
              />
              {errors.email && (
                <div className="form-error">{errors.email.message}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                placeholder="Enter your password"
              />
              {errors.password && (
                <div className="form-error">{errors.password.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <div className="card-footer text-center">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
