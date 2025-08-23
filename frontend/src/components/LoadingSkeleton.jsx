import React from "react";

const LoadingSkeleton = ({ type = "default", count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case "table-row":
        return (
          <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
            <td style={{ padding: "1rem" }}>
              <div className="admin-skeleton admin-skeleton-avatar"></div>
            </td>
            <td style={{ padding: "1rem" }}>
              <div className="admin-skeleton admin-skeleton-text wide"></div>
              <div className="admin-skeleton admin-skeleton-text narrow"></div>
            </td>
            <td style={{ padding: "1rem" }}>
              <div className="admin-skeleton admin-skeleton-text narrow"></div>
            </td>
            <td style={{ padding: "1rem" }}>
              <div className="admin-skeleton admin-skeleton-text narrow"></div>
            </td>
            <td style={{ padding: "1rem" }}>
              <div className="admin-skeleton admin-skeleton-text wide"></div>
            </td>
            <td style={{ padding: "1rem" }}>
              <div className="admin-skeleton admin-skeleton-text narrow"></div>
            </td>
            <td style={{ padding: "1rem", textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "center",
                }}
              >
                <div
                  className="admin-skeleton"
                  style={{ width: "60px", height: "32px" }}
                ></div>
                <div
                  className="admin-skeleton"
                  style={{ width: "60px", height: "32px" }}
                ></div>
              </div>
            </td>
          </tr>
        );

      case "stat-card":
        return (
          <div className="card" style={{ textAlign: "center" }}>
            <div className="card-body">
              <div
                className="admin-skeleton admin-skeleton-avatar"
                style={{ margin: "0 auto 0.5rem" }}
              ></div>
              <div
                className="admin-skeleton admin-skeleton-text wide"
                style={{ margin: "0.5rem auto" }}
              ></div>
              <div
                className="admin-skeleton admin-skeleton-text narrow"
                style={{ margin: "0 auto" }}
              ></div>
            </div>
          </div>
        );

      case "order-card":
        return (
          <div className="card">
            <div className="card-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div className="admin-skeleton admin-skeleton-text wide"></div>
                  <div className="admin-skeleton admin-skeleton-text narrow"></div>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div
                    className="admin-skeleton"
                    style={{ width: "80px", height: "30px" }}
                  ></div>
                  <div
                    className="admin-skeleton admin-skeleton-text"
                    style={{ width: "60px" }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: "2rem",
                }}
              >
                <div>
                  <div className="admin-skeleton admin-skeleton-text wide"></div>
                  <div style={{ margin: "1rem 0" }}>
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "0.75rem",
                          backgroundColor: "#f9fafb",
                          borderRadius: "6px",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div className="admin-skeleton admin-skeleton-text wide"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="admin-skeleton admin-skeleton-text wide"></div>
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "6px",
                      margin: "1rem 0",
                    }}
                  >
                    <div className="admin-skeleton admin-skeleton-text wide"></div>
                    <div className="admin-skeleton admin-skeleton-text"></div>
                    <div className="admin-skeleton admin-skeleton-text narrow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ padding: "1rem" }}>
            <div className="admin-skeleton admin-skeleton-text wide"></div>
            <div className="admin-skeleton admin-skeleton-text"></div>
            <div className="admin-skeleton admin-skeleton-text narrow"></div>
          </div>
        );
    }
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
};

export default LoadingSkeleton;
