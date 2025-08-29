import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import "./OrdersPage.css";

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders`
      );
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/cancel`
      );
      setMessage("Order cancelled successfully");
      fetchOrders(); // Refresh orders
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error cancelling order:", error);
      setError(error.response?.data?.message || "Failed to cancel order");
      setTimeout(() => setError(""), 3000);
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

  const handleItemClick = (item) => {
    // Check if plantId exists (either as populated object or as string)
    let plantId = null;

    if (item.plantId) {
      // If plantId is populated as an object, get the _id
      if (typeof item.plantId === "object" && item.plantId._id) {
        plantId = item.plantId._id;
      }
      // If plantId is just a string, use it directly
      else if (typeof item.plantId === "string") {
        plantId = item.plantId;
      }
    }

    if (plantId) {
      navigate(`/plant/${plantId}`);
    } else {
      // Show a brief message if plant is not available
      setMessage("This plant is no longer available");
      setTimeout(() => setMessage(""), 3000);
    }
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

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

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
                          className={`order-item ${
                            item.plantId ? "clickable-item" : ""
                          }`}
                          onClick={() => handleItemClick(item)}
                        >
                          <span className="item-name">
                            {item.plantName ||
                              item.plantId?.name ||
                              "Unknown Plant"}{" "}
                            × {item.quantity}
                          </span>
                          <span className="item-price">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                      <div className="order-item total-row">
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
    </div>
  );
};

export default OrdersPage;
