// Admin dashboard displaying key metrics and system overview
// Shows statistics for plants, orders, users and provides quick action buttons
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Memoized components to prevent unnecessary re-renders
const StatCard = ({ icon, value, label, color }) => (
  <div className="card" style={{ textAlign: "center" }}>
    <div className="card-body">
      <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{icon}</div>
      <h3
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color,
          margin: "0.5rem 0",
        }}
      >
        {value}
      </h3>
      <p style={{ color: "#6b7280", margin: 0 }}>{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Memoized color mapping function
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

  // Optimized fetch function with error handling and caching
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      // Use Promise.all for concurrent requests instead of sequential
      const [plantsStatsResponse, ordersResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/plants/stats/count`), // Use dedicated stats endpoint
        axios.get(`${import.meta.env.VITE_API_URL}/orders/admin/stats`),
      ]);

      // Use the stats from the dedicated endpoint
      const { totalPlants } = plantsStatsResponse.data.stats;

      setStats({
        totalPlants,
        ...ordersResponse.data.stats,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalPlants: 0,
        totalOrders: 0,
        totalRevenue: 0,
        ordersByStatus: [],
        recentOrders: [],
      });
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Memoize expensive calculations
  const pendingOrdersCount = useMemo(() => {
    return stats?.ordersByStatus?.find((s) => s._id === "pending")?.count || 0;
  }, [stats]);

  // Memoized refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Admin Dashboard
        </h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/admin/plants" className="btn btn-primary">
            Manage Plants
          </Link>
          <Link to="/admin/orders" className="btn btn-secondary">
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Stats Cards - using memoized component */}
      <div className="grid grid-cols-4" style={{ marginBottom: "3rem" }}>
        <StatCard
          icon="🌱"
          value={stats.totalPlants}
          label="Total Plants"
          color="#22c55e"
        />
        <StatCard
          icon="📦"
          value={stats.totalOrders}
          label="Total Orders"
          color="#3b82f6"
        />
        <StatCard
          icon="💰"
          value={`₹${Math.floor(stats.totalRevenue) || "0"}`}
          label="Total Revenue"
          color="#10b981"
        />
        <StatCard
          icon="📊"
          value={pendingOrdersCount}
          label="Pending Orders"
          color="#8b5cf6"
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        {/* Order Status Overview */}
        <div className="card">
          <div className="card-header">
            <h2>Orders by Status</h2>
          </div>
          <div className="card-body">
            {stats.ordersByStatus && stats.ordersByStatus.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {stats.ordersByStatus.map((statusGroup) => (
                  <div
                    key={statusGroup._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: getStatusColor(statusGroup._id),
                        }}
                      ></span>
                      <span
                        style={{
                          textTransform: "capitalize",
                          fontWeight: "500",
                        }}
                      >
                        {statusGroup._id}
                      </span>
                    </div>
                    <span style={{ fontWeight: "bold" }}>
                      {statusGroup.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#6b7280", textAlign: "center" }}>
                No orders yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h2>Recent Orders</h2>
          </div>
          <div className="card-body">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {stats.recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    style={{
                      padding: "1rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontWeight: "600" }}>
                        #{order._id.slice(-8)}
                      </span>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          backgroundColor: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status),
                          textTransform: "capitalize",
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        {order.customerName}
                      </span>
                      <span style={{ fontWeight: "bold" }}>
                        ₹{Math.floor(order.total)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        marginTop: "0.25rem",
                      }}
                    >
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#6b7280", textAlign: "center" }}>
                No recent orders
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <div className="card-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <Link
              to="/admin/plants"
              className="btn btn-outline"
              style={{ textDecoration: "none" }}
            >
              🌱 Add New Plant
            </Link>
            <Link
              to="/admin/orders"
              className="btn btn-outline"
              style={{ textDecoration: "none" }}
            >
              📦 View All Orders
            </Link>
            <button
              onClick={handleRefresh}
              className="btn btn-outline"
              style={{ border: "2px solid #6b7280", color: "#6b7280" }}
            >
              🔄 Refresh Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
