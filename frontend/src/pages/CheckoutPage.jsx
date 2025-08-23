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
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          deliveryAddress: {
            street: data.street,
            city: data.city,
            state: data.state,
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
                          src={`http://localhost:5000/uploads/${item.plantId.image}`}
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
                    className="form-input"
                    placeholder="Enter your street address"
                    {...register("street", {
                      required: "Street address is required",
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
                      className="form-input"
                      placeholder="City"
                      {...register("city", { required: "City is required" })}
                    />
                    {errors.city && (
                      <div className="form-error">{errors.city.message}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="State"
                      {...register("state", { required: "State is required" })}
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
                      className="form-input"
                      placeholder="ZIP Code"
                      {...register("zipCode", {
                        required: "ZIP Code is required",
                      })}
                    />
                    {errors.zipCode && (
                      <div className="form-error">{errors.zipCode.message}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Phone number"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9+\-\s()]+$/,
                          message: "Invalid phone number",
                        },
                      })}
                    />
                    {errors.phone && (
                      <div className="form-error">{errors.phone.message}</div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full btn-lg"
                  disabled={loading}
                  style={{ marginTop: "1rem" }}
                >
                  {loading ? "Placing Order..." : "Place Order (COD)"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
