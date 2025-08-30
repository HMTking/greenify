// Customer orders page displaying order history with status and details
// Shows past orders with items purchased and order tracking information
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import "./OrdersPage.css";

// Toast Notification Component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: type === "error" ? "#fee2e2" : "#dcfce7",
        color: type === "error" ? "#dc2626" : "#15803d",
        padding: "1rem 1.5rem",
        borderRadius: "8px",
        border: type === "error" ? "1px solid #fecaca" : "1px solid #bbf7d0",
        zIndex: 9999,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        fontSize: "0.875rem",
        fontWeight: "500",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{message}</span>
        <button
          onClick={onClose}
          style={{
            marginLeft: "1rem",
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
            color: "inherit",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Rating Modal Component
const RatingModal = ({
  isOpen,
  onClose,
  orderItem,
  orderId,
  onRatingSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initialize with existing rating data when editing
  useEffect(() => {
    if (isOpen) {
      if (orderItem?.existingRating) {
        setRating(orderItem.existingRating.rating);
      } else {
        // Reset for new rating
        setRating(0);
      }
      setHoveredRating(0);
      setError("");
      setSuccess("");
    }
  }, [isOpen, orderItem]);

  const isEditing = orderItem?.existingRating;

  const extractPlantId = (plantId) => {
    if (!plantId) return null;
    return typeof plantId === "object" && plantId._id ? plantId._id : plantId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const plantId = extractPlantId(orderItem.plantId);
      if (!plantId) {
        setError("Plant ID not found");
        return;
      }

      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/ratings`,
        {
          plantId,
          orderId,
          rating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success message in modal
      const successMessage = isEditing
        ? "Rating updated successfully!"
        : "Rating submitted successfully!";
      setSuccess(successMessage);

      // Call parent handler to update order data without page refresh
      onRatingSubmit(isEditing, plantId);

      // Auto close modal after showing success message
      setTimeout(() => {
        onClose();
        setRating(0);
        setHoveredRating(0);
        setSuccess("");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          maxWidth: "400px",
          width: "100%",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#1f2937",
            }}
          >
            {isEditing ? "Edit Rating" : "Rate Plant"}
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280",
              padding: "0.25rem",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              padding: "0.75rem",
              borderRadius: "6px",
              marginBottom: "1rem",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: "#dcfce7",
              color: "#15803d",
              padding: "0.75rem",
              borderRadius: "6px",
              marginBottom: "1rem",
              fontSize: "0.875rem",
              border: "1px solid #bbf7d0",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                {orderItem?.plantName}
              </span>
              {(hoveredRating || rating) > 0 && (
                <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  ({hoveredRating === 1 && "Poor"}
                  {hoveredRating === 2 && "Fair"}
                  {hoveredRating === 3 && "Good"}
                  {hoveredRating === 4 && "Very Good"}
                  {hoveredRating === 5 && "Excellent"}
                  {!hoveredRating && rating === 1 && "Poor"}
                  {!hoveredRating && rating === 2 && "Fair"}
                  {!hoveredRating && rating === 3 && "Good"}
                  {!hoveredRating && rating === 4 && "Very Good"}
                  {!hoveredRating && rating === 5 && "Excellent"})
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.125rem",
                justifyContent: "center",
              }}
            >
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoveredRating(starValue)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    border: "none",
                    background: "none",
                    fontSize: "1.75rem",
                    cursor: "pointer",
                    padding: "0.25rem",
                    borderRadius: "50%",
                    transition: "all 0.15s ease",
                    transform:
                      hoveredRating >= starValue || rating >= starValue
                        ? "scale(1.05)"
                        : "scale(1)",
                    color:
                      hoveredRating >= starValue ||
                      (hoveredRating === 0 && rating >= starValue)
                        ? "#fbbf24"
                        : "#e5e7eb",
                  }}
                >
                  {hoveredRating >= starValue ||
                  (hoveredRating === 0 && rating >= starValue)
                    ? "★"
                    : "☆"}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "white",
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              style={{
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "6px",
                background: submitting || rating === 0 ? "#9ca3af" : "#22c55e",
                color: "white",
                cursor: submitting || rating === 0 ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              {submitting
                ? isEditing
                  ? "Updating..."
                  : "Submitting..."
                : isEditing
                ? "Update"
                : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Toast notification states
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);

  const showToastNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const hideToast = () => {
    setShowToast(false);
    setToastMessage("");
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToastNotification("Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderItemRating = (orderId, plantId, rated = true) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId
          ? {
              ...order,
              items: order.items.map((item) => {
                const itemPlantId = extractPlantId(item.plantId);
                return itemPlantId === plantId ? { ...item, rated } : item;
              }),
            }
          : order
      )
    );
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showToastNotification("Order cancelled successfully");
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error("Error cancelling order:", error);
      showToastNotification(
        error.response?.data?.message || "Failed to cancel order",
        "error"
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#f59e0b";
      case "processing":
        return "#3b82f6";
      case "shipped":
        return "#8b5cf6";
      case "delivered":
        return "#22c55e";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const canCancelOrder = (order) => {
    return order.status.toLowerCase() === "pending";
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleEditRating = async (item, orderId) => {
    try {
      const plantId = extractPlantId(item.plantId);
      if (!plantId) {
        showToastNotification("Plant ID not found", "error");
        return;
      }

      // Load existing rating data
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/ratings/user/existing/${orderId}/${plantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Set the existing rating data for editing
      const itemWithRating = { ...item, existingRating: response.data.rating };
      setSelectedItem(itemWithRating);
      setSelectedOrderId(orderId);
      setShowRatingModal(true);
    } catch (error) {
      console.error("Error loading existing rating:", error);
      showToastNotification(
        error.response?.data?.message || "Failed to load existing rating",
        "error"
      );
    }
  };

  const extractPlantId = (plantId) => {
    if (!plantId) return null;
    return typeof plantId === "object" && plantId._id ? plantId._id : plantId;
  };

  const handleItemClick = (item) => {
    const plantId = extractPlantId(item.plantId);
    if (plantId) {
      navigate(`/plant/${plantId}`);
    } else {
      showToastNotification("This plant is no longer available", "error");
    }
  };

  const handleRateItem = (item, orderId) => {
    setSelectedItem(item);
    setSelectedOrderId(orderId);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = (isUpdate = false, plantId = null) => {
    // Update the specific order item's rating status without full page refresh
    if (plantId && selectedOrderId) {
      updateOrderItemRating(selectedOrderId, plantId, true);
    }

    // Show success notification via toast (will be handled in modal)
    // No need to set message here since modal handles its own success state
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "2rem 0", textAlign: "center" }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container orders-page" style={{ padding: "2rem 0" }}>
      <h1 className="page-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <h3>No orders found</h3>
          <p>You haven't placed any orders yet.</p>
          <a href="/catalogue" className="btn btn-primary">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Summary View - Always Visible */}
              <div
                className="order-summary"
                onClick={() => toggleOrderDetails(order._id)}
                style={{ cursor: "pointer" }}
              >
                <div className="order-summary-content">
                  <div className="order-date">
                    <span className="label">Order Date:</span>
                    <span className="value">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="order-amount">
                    <span className="label">Amount:</span>
                    <span className="value">₹{parseInt(order.total)}</span>
                  </div>

                  <div className="order-status-container">
                    <span
                      className={`order-status status-${order.status.toLowerCase()}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed View - Expandable */}
              {expandedOrder === order._id && (
                <div className="order-details">
                  <div className="order-id">
                    <strong>
                      Order ID: #{order._id.slice(-6).toUpperCase()}
                    </strong>
                  </div>

                  <div className="order-items">
                    <h4>Items:</h4>
                    <div className="items-list">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="order-item-container"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div
                            className={`order-item ${
                              item.plantId ? "clickable-item" : ""
                            }`}
                            onClick={() => handleItemClick(item)}
                            style={{
                              flex: 1,
                              cursor: item.plantId ? "pointer" : "default",
                            }}
                          >
                            <span className="item-name">
                              {item.plantName ||
                                item.plantId?.name ||
                                "Unknown Plant"}{" "}
                              × {item.quantity}
                            </span>
                            <span
                              className="item-price"
                              style={{ marginLeft: "1rem" }}
                            >
                              ₹{item.price * item.quantity}
                            </span>
                          </div>

                          {/* Rating Button for Delivered Items */}
                          {order.status === "delivered" && !item.rated && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateItem(item, order._id);
                              }}
                              style={{
                                padding: "0.5rem 1rem",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                                marginLeft: "1rem",
                              }}
                            >
                              Rate Plant
                            </button>
                          )}

                          {/* Edit Rating Button for Already Rated Items */}
                          {order.status === "delivered" && item.rated && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditRating(item, order._id);
                              }}
                              style={{
                                padding: "0.5rem 1rem",
                                backgroundColor: "#22c55e",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                                marginLeft: "1rem",
                              }}
                            >
                              Edit Rating
                            </button>
                          )}
                        </div>
                      ))}
                      <div
                        className="order-item total-row"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.75rem",
                          backgroundColor: "#f9fafb",
                          borderRadius: "6px",
                          marginTop: "0.5rem",
                        }}
                      >
                        <span className="item-name">
                          <strong>Total:</strong>
                        </span>
                        <span className="item-price total-price">
                          <strong>₹{parseInt(order.total)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="order-address">
                    <h4>Delivery Address:</h4>
                    <p>{order.deliveryAddress.street}</p>
                    <p>
                      {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.state}{" "}
                      {order.deliveryAddress.zipCode}
                    </p>
                    <p>Phone: {order.deliveryAddress.phone}</p>
                  </div>

                  <div className="order-timing">
                    <p>
                      <strong>Order Placed:</strong>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    {order.updatedAt !== order.createdAt && (
                      <p>
                        <strong>Last Updated:</strong>{" "}
                        {new Date(order.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {canCancelOrder(order) && (
                    <div className="cancel-note">
                      <small>
                        <strong>Note:</strong> You can cancel this order while
                        it's still pending. Once processing begins, cancellation
                        won't be possible.
                      </small>
                    </div>
                  )}

                  {/* Cancel Button at Bottom */}
                  {canCancelOrder(order) && (
                    <div className="order-bottom-actions">
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="btn btn-cancel-bottom"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        orderItem={selectedItem}
        orderId={selectedOrderId}
        onRatingSubmit={handleRatingSubmit}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={hideToast}
      />
    </div>
  );
};

export default OrdersPage;
