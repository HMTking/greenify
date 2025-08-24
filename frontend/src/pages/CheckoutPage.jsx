import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Watch form values for real-time validation feedback
  const watchedPhone = watch("phone");
  const watchedZipCode = watch("zipCode");

  // Helper function to handle numeric input only
  const handleNumericInput = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    return value;
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    // Pre-fill form with user's saved address
    if (user?.address) {
      setValue("street", user.address.street || "");
      setValue("city", user.address.city || "");
      setValue("state", user.address.state || "");
      setValue("zipCode", user.address.zipCode || "");
      setValue("phone", user.address.phone || "");
    }
  }, [items, navigate, user, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    // Additional validation before submission
    if (!/^[6-9]\d{9}$/.test(data.phone)) {
      setError(
        "Please enter a valid 10-digit Indian mobile number starting with 6-9"
      );
      setLoading(false);
      return;
    }

    if (!/^[0-9]{6}$/.test(data.zipCode)) {
      setError("Please enter a valid 6-digit ZIP code");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          deliveryAddress: {
            street: data.street.trim(),
            city: data.city.trim(),
            state: data.state.trim(),
            zipCode: data.zipCode,
            phone: data.phone,
          },
        }
      );

      if (response.data.success) {
        setMessage("Order placed successfully!");
        setTimeout(() => {
          clearCart();
          navigate("/orders");
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect to cart
  }

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <h1 className="page-title">Checkout</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}
      >
        {/* Order Summary */}
        <div>
          <h2 style={{ marginBottom: "1.5rem" }}>Order Summary</h2>

          <div className="card">
            <div className="card-body">
              {items.map((item) => (
                <div
                  key={item.plantId._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem 0",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.plantId.image ? (
                        <img
                          src={item.plantId.image}
                          alt={item.plantId.name}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        <span>🌱</span>
                      )}
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0" }}>
                        {item.plantId.name}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          color: "#6b7280",
                          fontSize: "0.9rem",
                        }}
                      >
                        Qty: {item.quantity} × ₹{item.plantId.price}
                      </p>
                    </div>
                  </div>
                  <div style={{ fontWeight: "bold" }}>
                    ₹{item.plantId.price * item.quantity}
                  </div>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "1rem",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                }}
              >
                <span>Total:</span>
                <span style={{ color: "#22c55e" }}>₹{total}</span>
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "6px",
                  border: "1px solid #bae6fd",
                }}
              >
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#0369a1" }}>
                  💳 Payment Method: Cash on Delivery (COD)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address Form */}
        <div>
          <h2 style={{ marginBottom: "1.5rem" }}>Delivery Address</h2>

          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.street ? "error" : ""}`}
                    placeholder="Enter your complete street address"
                    {...register("street", {
                      required: "Street address is required",
                      minLength: {
                        value: 10,
                        message:
                          "Street address must be at least 10 characters",
                      },
                      maxLength: {
                        value: 200,
                        message: "Street address cannot exceed 200 characters",
                      },
                    })}
                  />
                  {errors.street && (
                    <div className="form-error">{errors.street.message}</div>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.city ? "error" : ""}`}
                      placeholder="City"
                      {...register("city", {
                        required: "City is required",
                        minLength: {
                          value: 2,
                          message: "City name must be at least 2 characters",
                        },
                        maxLength: {
                          value: 50,
                          message: "City name cannot exceed 50 characters",
                        },
                        pattern: {
                          value: /^[a-zA-Z\s]+$/,
                          message:
                            "City name can only contain letters and spaces",
                        },
                      })}
                    />
                    {errors.city && (
                      <div className="form-error">{errors.city.message}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.state ? "error" : ""}`}
                      placeholder="State"
                      {...register("state", {
                        required: "State is required",
                        minLength: {
                          value: 2,
                          message: "State name must be at least 2 characters",
                        },
                        maxLength: {
                          value: 50,
                          message: "State name cannot exceed 50 characters",
                        },
                        pattern: {
                          value: /^[a-zA-Z\s]+$/,
                          message:
                            "State name can only contain letters and spaces",
                        },
                      })}
                    />
                    {errors.state && (
                      <div className="form-error">{errors.state.message}</div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">ZIP Code *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.zipCode ? "error" : ""}`}
                      placeholder="e.g., 110001"
                      maxLength="6"
                      onInput={(e) => {
                        e.target.value = handleNumericInput(e);
                      }}
                      {...register("zipCode", {
                        required: "ZIP Code is required",
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: "ZIP Code must be exactly 6 digits",
                        },
                      })}
                    />
                    {errors.zipCode && (
                      <div className="form-error">{errors.zipCode.message}</div>
                    )}
                    {!errors.zipCode &&
                      watchedZipCode &&
                      watchedZipCode.length > 0 &&
                      watchedZipCode.length < 6 && (
                        <div className="form-help">
                          ZIP Code should be 6 digits
                        </div>
                      )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className={`form-input ${errors.phone ? "error" : ""}`}
                      placeholder="e.g., 9876543210"
                      maxLength="10"
                      onInput={(e) => {
                        e.target.value = handleNumericInput(e);
                      }}
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message:
                            "Please enter a valid 10-digit Indian mobile number",
                        },
                        minLength: {
                          value: 10,
                          message: "Phone number must be exactly 10 digits",
                        },
                        maxLength: {
                          value: 10,
                          message: "Phone number must be exactly 10 digits",
                        },
                      })}
                    />
                    {errors.phone && (
                      <div className="form-error">{errors.phone.message}</div>
                    )}
                    {!errors.phone &&
                      watchedPhone &&
                      watchedPhone.length > 0 &&
                      watchedPhone.length < 10 && (
                        <div className="form-help">
                          Mobile number should start with 6-9 and be 10 digits
                        </div>
                      )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full btn-lg"
                  disabled={loading || Object.keys(errors).length > 0}
                  style={{
                    marginTop: "1rem",
                    opacity: Object.keys(errors).length > 0 ? 0.6 : 1,
                  }}
                >
                  {loading
                    ? "Placing Order..."
                    : `Place Order (₹${total} - COD)`}
                </button>

                {Object.keys(errors).length > 0 && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.75rem",
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      color: "#dc2626",
                    }}
                  >
                    <strong>Please fix the following errors:</strong>
                    <ul style={{ margin: "0.5rem 0 0 1rem", padding: 0 }}>
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field} style={{ marginBottom: "0.25rem" }}>
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
