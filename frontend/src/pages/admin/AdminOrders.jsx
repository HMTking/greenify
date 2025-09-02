// Admin orders management page for viewing and updating order status
// Displays all orders with filtering, status updates and customer details
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../utils/api";

// Memoized Order Card Component
const OrderCard = ({
  order,
  onStatusUpdate,
  getStatusColor,
  getStatusOptions,
}) => (
  <div className="card">
    <div className="card-header">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 0.5rem 0" }}>
            Order #{order._id.slice(-8)}
          </h3>
          <div
            style={{
              display: "flex",
              gap: "2rem",
              fontSize: "0.9rem",
              color: "#6b7280",
              flexWrap: "wrap",
            }}
          >
            <span>
              <strong>Customer:</strong> {order.customerName}
            </span>
            <span>
              <strong>Email:</strong> {order.customerEmail}
            </span>
            <span>
              <strong>Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontSize: "0.875rem",
              fontWeight: "600",
              backgroundColor: `${getStatusColor(order.status)}20`,
              color: getStatusColor(order.status),
              textTransform: "capitalize",
            }}
          >
            {order.status}
          </span>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "1.25rem",
              color: "#22c55e",
            }}
          >
            ₹{Math.floor(order.total)}
          </div>
        </div>
      </div>
    </div>

    <div className="card-body">
      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}
      >
        <div>
          <h4 style={{ marginBottom: "1rem" }}>
            Order Items ({order.items.length}):
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {order.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                }}
              >
                <div>
                  <span style={{ fontWeight: "600" }}>{item.plantName}</span>
                  <span style={{ color: "#6b7280", marginLeft: "0.5rem" }}>
                    × {item.quantity}
                  </span>
                </div>
                <div style={{ fontWeight: "600" }}>
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: "1rem" }}>Delivery Address:</h4>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#f9fafb",
              borderRadius: "6px",
              marginBottom: "1.5rem",
            }}
          >
            <p style={{ margin: "0 0 0.5rem 0" }}>
              <strong>{order.customerName}</strong>
            </p>
            <p
              style={{
                margin: "0 0 0.5rem 0",
                color: "#6b7280",
                lineHeight: "1.4",
              }}
            >
              {order.deliveryAddress.street}
              <br />
              {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
              {order.deliveryAddress.zipCode}
              <br />
              Phone: {order.deliveryAddress.phone}
            </p>
          </div>

          {getStatusOptions(order.status).length > 0 && (
            <div>
              <h4 style={{ marginBottom: "1rem" }}>Update Status:</h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {getStatusOptions(order.status).map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusUpdate(order._id, status)}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: getStatusColor(status),
                      color: "white",
                      textTransform: "capitalize",
                    }}
                  >
                    Mark as {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const AdminOrders = () => {
  const [allOrders, setAllOrders] = useState([]); // Store all orders
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);

  const getStatusColor = useCallback((status) => {
    const colors = {
      pending: "#f59e0b",
      processing: "#3b82f6",
      shipped: "#8b5cf6",
      delivered: "#10b981",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  }, []);

  const getStatusOptions = useCallback((currentStatus) => {
    const statusFlow = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  }, []);

  // Fetch all orders once and filter client-side
  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/admin/all`, {
        headers: {
          "Cache-Control": "max-age=30", // Cache for 30 seconds
        },
      });
      setAllOrders(response.data.orders);
    } catch (error) {
      setError("Failed to fetch orders");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch orders once on component mount
  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Handle filter change without reloading
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      setMessage("Order status updated successfully!");

      // Update the order in the local state instead of refetching
      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update order status"
      );
      setTimeout(() => setError(""), 3000);
    }
  }, []);

  // Filter orders by status
  const statusFilteredOrders = useMemo(() => {
    if (filter === "all") return allOrders;
    return allOrders.filter((order) => order.status === filter);
  }, [allOrders, filter]);

  // Further filter by search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return statusFilteredOrders;
    return statusFilteredOrders.filter(
      (order) =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.includes(searchTerm)
    );
  }, [statusFilteredOrders, searchTerm]);

  // Memoized pagination
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, ordersPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

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
    <div className="container" style={{ padding: "2rem 0" }}>
      <h1 className="page-title">Manage Orders ({filteredOrders.length})</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Search and Filter Controls */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search by customer name, email, or order ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            flex: "1",
            minWidth: "300px",
            padding: "0.75rem",
            border: "2px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "1rem",
          }}
        />

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            "all",
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
          ].map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              style={{
                padding: "0.5rem 1rem",
                border: "2px solid",
                borderColor: filter === status ? "#22c55e" : "#d1d5db",
                backgroundColor: filter === status ? "#22c55e" : "white",
                color: filter === status ? "white" : "#374151",
                borderRadius: "6px",
                cursor: "pointer",
                textTransform: "capitalize",
                fontWeight: "500",
                fontSize: "0.875rem",
                transition: "all 0.2s ease", // Smooth transition
              }}
            >
              {status === "all" ? "All" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {paginatedOrders.length === 0 ? (
        <div className="text-center" style={{ padding: "3rem 0" }}>
          <h3>No orders found</h3>
          <p>
            {searchTerm
              ? "No orders match your search criteria."
              : "No orders match your current filter."}
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              transition: "opacity 0.3s ease-in-out",
              opacity: 1,
            }}
          >
            {paginatedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={updateOrderStatus}
                getStatusColor={getStatusColor}
                getStatusOptions={getStatusOptions}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "2rem",
                gap: "1rem",
              }}
            >
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-sm"
                style={{
                  backgroundColor: currentPage === 1 ? "#f3f4f6" : "#e5e7eb",
                  color: currentPage === 1 ? "#9ca3af" : "#374151",
                }}
              >
                ← Previous
              </button>

              <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Page {currentPage} of {totalPages} ({filteredOrders.length}{" "}
                orders)
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="btn btn-sm"
                style={{
                  backgroundColor:
                    currentPage === totalPages ? "#f3f4f6" : "#e5e7eb",
                  color: currentPage === totalPages ? "#9ca3af" : "#374151",
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrders;
