// Admin plant management page for CRUD operations on plant inventory
// Handles adding, editing, deleting plants with image upload and form validation
import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import api from "../../utils/api";

// Available category options
const CATEGORY_OPTIONS = [
  "Indoor",
  "Outdoor",
  "Succulents",
  "Flowering",
  "Herbs",
  "Trees",
];

// Multi-Select Category Component
const CategorySelector = ({ selectedCategories, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];
    onChange(updated);
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        className="form-input"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "2.5rem",
          backgroundColor: "#fff",
          border: error ? "2px solid #ef4444" : "2px solid #e5e7eb",
        }}
      >
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", flex: 1 }}
        >
          {selectedCategories.length === 0 ? (
            <span style={{ color: "#9ca3af" }}>Select categories...</span>
          ) : (
            selectedCategories.map((category) => (
              <span
                key={category}
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {category}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(category);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                  }}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "2px solid #e5e7eb",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            zIndex: 10,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {CATEGORY_OPTIONS.map((category) => (
            <div
              key={category}
              onClick={() => toggleCategory(category)}
              style={{
                padding: "0.75rem 1rem",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f3f4f6",
                backgroundColor: selectedCategories.includes(category)
                  ? "#f0f9ff"
                  : "#fff",
                color: selectedCategories.includes(category)
                  ? "#0369a1"
                  : "#374151",
              }}
              onMouseEnter={(e) => {
                if (!selectedCategories.includes(category)) {
                  e.target.style.backgroundColor = "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedCategories.includes(category)) {
                  e.target.style.backgroundColor = "#fff";
                }
              }}
            >
              <span>{category}</span>
              {selectedCategories.includes(category) && (
                <span style={{ color: "#0369a1", fontWeight: "bold" }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Memoized Plant Row Component
const PlantRow = ({ plant, onEdit, onDelete }) => (
  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
    <td style={{ padding: "1rem" }}>
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
        {plant.image ? (
          <img
            src={plant.image}
            alt={plant.name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "cover",
              borderRadius: "6px",
            }}
            loading="lazy"
          />
        ) : (
          <span>🌱</span>
        )}
      </div>
    </td>
    <td style={{ padding: "1rem" }}>
      <div>
        <div
          style={{ fontWeight: "600", color: "#4f46e5", fontSize: "0.875rem" }}
        >
          {plant.plantId || "No ID"}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "#9ca3af",
            marginTop: "0.25rem",
          }}
        >
          #{plant._id.slice(-6)}
        </div>
      </div>
    </td>
    <td style={{ padding: "1rem" }}>
      <div>
        <div style={{ fontWeight: "600" }}>{plant.name}</div>
        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          {plant.description.substring(0, 40)}...
        </div>
      </div>
    </td>
    <td style={{ padding: "1rem" }}>
      <div style={{ fontWeight: "600", color: "#22c55e" }}>₹{plant.price}</div>
      {plant.originalPrice && plant.originalPrice > plant.price && (
        <div
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            textDecoration: "line-through",
          }}
        >
          ₹{plant.originalPrice}
        </div>
      )}
    </td>
    <td style={{ padding: "1rem" }}>
      <span
        style={{
          color: plant.stock > 0 ? "#22c55e" : "#ef4444",
          fontWeight: "600",
        }}
      >
        {plant.stock}
      </span>
    </td>
    <td style={{ padding: "1rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
        {plant.categories.slice(0, 2).map((category) => (
          <span
            key={category}
            style={{
              fontSize: "0.75rem",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              padding: "0.25rem 0.5rem",
              borderRadius: "12px",
            }}
          >
            {category}
          </span>
        ))}
        {plant.categories.length > 2 && (
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            +{plant.categories.length - 2}
          </span>
        )}
      </div>
    </td>
    <td style={{ padding: "1rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.125rem" }}>
            {(() => {
              const rating = plant.rating || 0;
              const stars = [];
              const fullStars = Math.floor(rating);
              const hasHalfStar = rating % 1 !== 0;

              // Full stars
              for (let i = 0; i < fullStars; i++) {
                stars.push(
                  <span
                    key={i}
                    style={{ color: "#fbbf24", fontSize: "0.875rem" }}
                  >
                    ★
                  </span>
                );
              }

              // Half star
              if (hasHalfStar) {
                stars.push(
                  <span
                    key="half"
                    style={{
                      position: "relative",
                      fontSize: "0.875rem",
                      color: "#d1d5db",
                    }}
                  >
                    ★
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        color: "#fbbf24",
                        overflow: "hidden",
                        width: "50%",
                      }}
                    >
                      ★
                    </span>
                  </span>
                );
              }

              // Empty stars
              const emptyStars = 5 - Math.ceil(rating);
              for (let i = 0; i < emptyStars; i++) {
                stars.push(
                  <span
                    key={`empty-${i}`}
                    style={{ color: "#d1d5db", fontSize: "0.875rem" }}
                  >
                    ☆
                  </span>
                );
              }

              return stars;
            })()}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            {plant.reviewCount > 0
              ? `${plant.rating} out of 5 (${plant.reviewCount})`
              : "No reviews"}
          </span>
        </div>
      </div>
    </td>
    <td style={{ padding: "1rem", textAlign: "center" }}>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
        <button
          onClick={() => onEdit(plant)}
          className="btn btn-sm"
          style={{ backgroundColor: "#3b82f6", color: "white" }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(plant._id)}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

const AdminPlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [plantsPerPage] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Optimized fetch with caching headers
  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔍 AdminPlants: Fetching plants...");
      console.log(
        "🔍 AdminPlants: API base URL:",
        import.meta.env.VITE_API_URL
      );
      console.log(
        "🔍 AdminPlants: Full URL:",
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/plants?limit=200`
      );

      const response = await api.get(
        `/plants?limit=200`, // Increased limit but still reasonable
        {
          headers: {
            "Cache-Control": "max-age=30", // Cache for 30 seconds
          },
        }
      );

      console.log("📊 AdminPlants: Response received:", response.data);
      console.log("📊 AdminPlants: Plants array:", response.data.plants);
      console.log(
        "📊 AdminPlants: Plants count:",
        response.data.plants ? response.data.plants.length : 0
      );
      setPlants(response.data.plants || []);
    } catch (error) {
      console.error("❌ AdminPlants: Error fetching plants:", error);
      console.error("❌ AdminPlants: Error response:", error.response);
      console.error("❌ AdminPlants: Error message:", error.message);
      console.error("❌ AdminPlants: Error status:", error.response?.status);
      console.error("❌ AdminPlants: Error data:", error.response?.data);
      setError(
        "Failed to fetch plants: " +
          (error.response?.data?.message || error.message)
      );
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  // Auto-clear global messages after 4 seconds
  useEffect(() => {
    if (message && !showForm) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message, showForm]);

  useEffect(() => {
    if (error && !showForm) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, showForm]);

  // Memoized filtered plants for better performance
  const filteredPlants = useMemo(() => {
    if (!searchTerm) return plants;
    return plants.filter(
      (plant) =>
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plant.plantId &&
          plant.plantId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        plant.categories.some((cat) =>
          cat.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [plants, searchTerm]);

  // Memoized pagination
  const paginatedPlants = useMemo(() => {
    const startIndex = (currentPage - 1) * plantsPerPage;
    const endIndex = startIndex + plantsPerPage;
    return filteredPlants.slice(startIndex, endIndex);
  }, [filteredPlants, currentPage, plantsPerPage]);

  const totalPages = Math.ceil(filteredPlants.length / plantsPerPage);

  const onSubmit = useCallback(
    async (data) => {
      try {
        setSubmitting(true);
        setError("");
        setMessage("");

        // Client-side validation with detailed error messages
        const validationErrors = [];

        // Name validation
        if (!data.name || data.name.trim().length < 2) {
          validationErrors.push(
            "Plant name must be at least 2 characters long"
          );
        }
        if (data.name && data.name.trim().length > 100) {
          validationErrors.push("Plant name cannot exceed 100 characters");
        }
        if (data.name && !/^[a-zA-Z\s'-]+$/.test(data.name.trim())) {
          validationErrors.push(
            "Plant name can only contain letters, spaces, hyphens, and apostrophes"
          );
        }

        // Description validation
        if (!data.description || data.description.trim().length < 10) {
          validationErrors.push(
            "Description must be at least 10 characters long"
          );
        }
        if (data.description && data.description.trim().length > 1000) {
          validationErrors.push("Description cannot exceed 1000 characters");
        }

        // Price validation
        const price = parseInt(data.price);
        if (!data.price || isNaN(price)) {
          validationErrors.push("Price is required and must be a valid number");
        } else if (price < 1) {
          validationErrors.push("Price must be at least ₹1");
        } else if (price > 999999) {
          validationErrors.push("Price cannot exceed ₹999,999");
        } else if (!Number.isInteger(price)) {
          validationErrors.push(
            "Price must be a whole number (no decimals allowed)"
          );
        }

        // Original price validation
        if (data.originalPrice && data.originalPrice.toString().trim()) {
          const originalPrice = parseInt(data.originalPrice);
          if (isNaN(originalPrice)) {
            validationErrors.push("Original price must be a valid number");
          } else if (!Number.isInteger(originalPrice)) {
            validationErrors.push(
              "Original price must be a whole number (no decimals allowed)"
            );
          } else if (originalPrice < price) {
            validationErrors.push(
              "Original price must be greater than or equal to current price"
            );
          } else if (originalPrice > 999999) {
            validationErrors.push("Original price cannot exceed ₹999,999");
          }
        }

        // Stock validation
        const stock = parseInt(data.stock);
        if (!data.stock && data.stock !== 0 && data.stock !== "0") {
          validationErrors.push("Stock quantity is required");
        } else if (isNaN(stock)) {
          validationErrors.push("Stock must be a valid number");
        } else if (stock < 0) {
          validationErrors.push("Stock cannot be negative");
        } else if (stock > 10000) {
          validationErrors.push("Stock cannot exceed 10,000 units");
        } else if (!Number.isInteger(stock)) {
          validationErrors.push("Stock must be a whole number");
        }

        // Categories validation
        if (selectedCategories.length === 0) {
          validationErrors.push("Please select at least one category");
        }
        if (selectedCategories.length > 5) {
          validationErrors.push("Cannot select more than 5 categories");
        }

        // Image validation
        if (data.image && data.image[0]) {
          const file = data.image[0];
          const maxSize = 5 * 1024 * 1024; // 5MB
          const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ];

          if (file.size > maxSize) {
            validationErrors.push("Image size cannot exceed 5MB");
          }
          if (!allowedTypes.includes(file.type.toLowerCase())) {
            validationErrors.push("Image must be in JPEG, PNG, or WebP format");
          }
        }

        // Display client-side validation errors
        if (validationErrors.length > 0) {
          setError(
            <div>
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "0.75rem",
                  color: "#dc2626",
                }}
              >
                ⚠️ Please fix the following errors:
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.5rem",
                  listStyle: "disc",
                  color: "#dc2626",
                }}
              >
                {validationErrors.map((err, index) => (
                  <li
                    key={index}
                    style={{
                      marginBottom: "0.5rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          );
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append("name", data.name.trim());
        formData.append("description", data.description.trim());
        formData.append("price", parseInt(data.price));
        if (data.originalPrice && data.originalPrice.toString().trim())
          formData.append("originalPrice", parseInt(data.originalPrice));

        // Send categories as JSON array instead of comma-separated string
        selectedCategories.forEach((category, index) => {
          formData.append(`categories[${index}]`, category);
        });

        formData.append("stock", parseInt(data.stock));

        if (data.image && data.image[0]) {
          formData.append("image", data.image[0]);
        }

        let response;
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        if (editingPlant) {
          response = await api.put(
            `/plants/${editingPlant._id}`,
            formData,
            config
          );
        } else {
          response = await api.post(`/plants`, formData, config);
        }

        // Check if response indicates success
        if (response.data && response.data.success) {
          const successMsg = editingPlant
            ? "Plant updated successfully!"
            : "Plant added successfully!";
          setMessage(successMsg);

          // Close form after a brief delay to show success message
          setTimeout(() => {
            setShowForm(false);
            setEditingPlant(null);
            reset();
            setSelectedCategories([]);
            fetchPlants(); // Only fetch after successful operation
            setSubmitting(false);
          }, 1500);
        }
      } catch (error) {
        console.error("Error saving plant:", error);
        console.error("Error response:", error.response);
        console.error("Error message:", error.message);

        let errorMessage;

        if (error.response && error.response.data) {
          const responseData = error.response.data;

          // Handle validation errors from server
          if (responseData.errors && Array.isArray(responseData.errors)) {
            errorMessage = (
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "0.75rem",
                    color: "#dc2626",
                  }}
                >
                  ❌ Server Validation Errors:
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.5rem",
                    listStyle: "disc",
                    color: "#dc2626",
                  }}
                >
                  {responseData.errors.map((err, index) => (
                    <li
                      key={index}
                      style={{
                        marginBottom: "0.5rem",
                        lineHeight: "1.4",
                      }}
                    >
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          // Handle single error message
          else if (responseData.message) {
            errorMessage = (
              <div style={{ color: "#dc2626" }}>
                <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                  ❌ Server Error:
                </div>
                <div>{responseData.message}</div>
              </div>
            );
          }
          // Handle specific field errors
          else if (responseData.error) {
            errorMessage = (
              <div style={{ color: "#dc2626" }}>
                <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                  ❌ Validation Error:
                </div>
                <div>{responseData.error}</div>
              </div>
            );
          }
          // Default server error
          else {
            errorMessage = `Server responded with error: ${error.response.status} - ${error.response.statusText}`;
          }
        }
        // Network or request errors
        else if (error.request) {
          errorMessage = (
            <div style={{ color: "#dc2626" }}>
              <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                🌐 Connection Error:
              </div>
              <div>
                Unable to connect to server. Please check your internet
                connection and try again.
              </div>
            </div>
          );
        }
        // Other errors
        else {
          errorMessage = (
            <div style={{ color: "#dc2626" }}>
              <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                ⚠️ Unexpected Error:
              </div>
              <div>
                {error.message ||
                  "An unknown error occurred while saving the plant."}
              </div>
            </div>
          );
        }

        setError(errorMessage);
        setSubmitting(false);
      }
    },
    [editingPlant, fetchPlants, reset, selectedCategories]
  );

  const handleEdit = useCallback(
    (plant) => {
      setEditingPlant(plant);
      setSelectedCategories(plant.categories || []);
      setValue("name", plant.name);
      setValue("description", plant.description);
      setValue("price", plant.price);
      setValue("originalPrice", plant.originalPrice);
      setValue("stock", plant.stock);
      setShowForm(true);
    },
    [setValue]
  );

  const handleDelete = useCallback(
    async (plantId) => {
      if (window.confirm("Are you sure you want to delete this plant?")) {
        try {
          await api.delete(`/plants/${plantId}`);
          setMessage("Plant deleted successfully!");
          fetchPlants();
          setTimeout(() => setMessage(""), 3000);
        } catch (error) {
          setError("Failed to delete plant");
          setTimeout(() => setError(""), 3000);
        }
      }
    },
    [fetchPlants]
  );

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditingPlant(null);
    setSelectedCategories([]);
    setError("");
    setMessage("");
    reset();
  }, [reset]);

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
      {/* Global Success/Error Messages */}
      {message && !showForm && (
        <div
          className="alert alert-success"
          style={{
            marginBottom: "2rem",
            backgroundColor: "#22c55e",
            color: "white",
            padding: "1rem",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "600",
          }}
        >
          ✅ {message}
        </div>
      )}

      {error && !showForm && (
        <div
          className="alert alert-error"
          style={{
            marginBottom: "2rem",
            backgroundColor: "#ef4444",
            color: "white",
            padding: "1rem",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "600",
          }}
        >
          ❌ {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Manage Plants ({filteredPlants.length})
        </h1>
        <button
          onClick={() => {
            setSelectedCategories([]);
            setError("");
            setMessage("");
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          + Add New Plant
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Search plants by Plant ID, name, or category..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "0.75rem",
            border: "2px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "1rem",
          }}
        />
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
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
            className="card"
            style={{
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div className="card-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2>{editingPlant ? "Edit Plant" : "Add New Plant"}</h2>
                {editingPlant && editingPlant.plantId && (
                  <div
                    style={{
                      backgroundColor: "#f3f4f6",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#4f46e5",
                      marginLeft: "1rem",
                    }}
                  >
                    Plant ID: {editingPlant.plantId}
                  </div>
                )}
                <button
                  onClick={resetForm}
                  style={{
                    border: "none",
                    background: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Messages inside the form modal */}
            {error && (
              <div className="alert alert-error" style={{ margin: "0 1.5rem" }}>
                {error}
              </div>
            )}
            {message && (
              <div
                className="alert alert-success"
                style={{ margin: "0 1.5rem" }}
              >
                {message}
              </div>
            )}

            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label className="form-label">
                    Plant Name *
                    <small
                      style={{
                        display: "block",
                        fontWeight: "normal",
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      Must be 2-100 characters, letters and spaces only
                    </small>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Monstera Deliciosa"
                    {...register("name", {
                      required: "Plant name is required",
                      minLength: {
                        value: 2,
                        message:
                          "Plant name must be at least 2 characters long",
                      },
                      maxLength: {
                        value: 100,
                        message: "Plant name cannot exceed 100 characters",
                      },
                      pattern: {
                        value: /^[a-zA-Z\s'-]+$/,
                        message:
                          "Plant name can only contain letters, spaces, hyphens, and apostrophes",
                      },
                    })}
                  />
                  {errors.name && (
                    <div
                      className="form-error"
                      style={{
                        color: "#dc2626",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      ⚠️ {errors.name.message}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Description *
                    <small
                      style={{
                        display: "block",
                        fontWeight: "normal",
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      Must be 10-1000 characters. Describe the plant's features,
                      care requirements, etc.
                    </small>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="Describe the plant's appearance, care requirements, benefits, and any special features..."
                    {...register("description", {
                      required: "Description is required",
                      minLength: {
                        value: 10,
                        message:
                          "Description must be at least 10 characters long",
                      },
                      maxLength: {
                        value: 1000,
                        message: "Description cannot exceed 1000 characters",
                      },
                    })}
                  />
                  {errors.description && (
                    <div
                      className="form-error"
                      style={{
                        color: "#dc2626",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      ⚠️ {errors.description.message}
                    </div>
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
                    <label className="form-label">
                      Price * (₹)
                      <small
                        style={{
                          display: "block",
                          fontWeight: "normal",
                          color: "#6b7280",
                          fontSize: "0.875rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        Whole numbers only, ₹1 - ₹999,999
                      </small>
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="999999"
                      className="form-input"
                      placeholder="e.g., 299"
                      {...register("price", {
                        required: "Price is required",
                        min: {
                          value: 1,
                          message: "Price must be at least ₹1",
                        },
                        max: {
                          value: 999999,
                          message: "Price cannot exceed ₹999,999",
                        },
                        pattern: {
                          value: /^\d+$/,
                          message: "Price must be a whole number (no decimals)",
                        },
                      })}
                    />
                    {errors.price && (
                      <div
                        className="form-error"
                        style={{
                          color: "#dc2626",
                          fontSize: "0.875rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        ⚠️ {errors.price.message}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Original Price (₹)
                      <small
                        style={{
                          display: "block",
                          fontWeight: "normal",
                          color: "#6b7280",
                          fontSize: "0.875rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        Optional, must be ≥ current price
                      </small>
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="999999"
                      className="form-input"
                      placeholder="e.g., 399"
                      {...register("originalPrice", {
                        min: {
                          value: 1,
                          message: "Original price must be at least ₹1",
                        },
                        max: {
                          value: 999999,
                          message: "Original price cannot exceed ₹999,999",
                        },
                        pattern: {
                          value: /^\d*$/,
                          message:
                            "Original price must be a whole number (no decimals)",
                        },
                      })}
                    />
                    {errors.originalPrice && (
                      <div
                        className="form-error"
                        style={{
                          color: "#dc2626",
                          fontSize: "0.875rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        ⚠️ {errors.originalPrice.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Categories *
                    <small
                      style={{
                        display: "block",
                        fontWeight: "normal",
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      Select 1-5 categories that best describe this plant
                    </small>
                  </label>
                  <CategorySelector
                    selectedCategories={selectedCategories}
                    onChange={setSelectedCategories}
                    error={selectedCategories.length === 0}
                  />
                  {selectedCategories.length === 0 && (
                    <div
                      className="form-error"
                      style={{
                        color: "#dc2626",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      ⚠️ At least one category is required
                    </div>
                  )}
                  {selectedCategories.length > 5 && (
                    <div
                      className="form-error"
                      style={{
                        color: "#dc2626",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      ⚠️ Cannot select more than 5 categories
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Stock Quantity *
                    <small
                      style={{
                        display: "block",
                        fontWeight: "normal",
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      Available units (0 - 10,000). Set to 0 if out of stock.
                    </small>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    step="1"
                    className="form-input"
                    placeholder="e.g., 50"
                    {...register("stock", {
                      required: "Stock quantity is required",
                      min: {
                        value: 0,
                        message: "Stock cannot be negative",
                      },
                      max: {
                        value: 10000,
                        message: "Stock cannot exceed 10,000 units",
                      },
                      pattern: {
                        value: /^\d+$/,
                        message: "Stock must be a whole number",
                      },
                    })}
                  />
                  {errors.stock && (
                    <div
                      className="form-error"
                      style={{
                        color: "#dc2626",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      ⚠️ {errors.stock.message}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Plant Image
                    <small
                      style={{
                        display: "block",
                        fontWeight: "normal",
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      Optional. JPEG, PNG, or WebP format. Max size: 5MB.
                    </small>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="form-input"
                    {...register("image")}
                  />
                  <small style={{ color: "#6b7280" }}>
                    Leave empty to keep current image (if editing)
                  </small>
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}
                >
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{
                      opacity: submitting ? 0.7 : 1,
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting
                      ? editingPlant
                        ? "Updating..."
                        : "Adding..."
                      : editingPlant
                      ? "Update Plant"
                      : "Add Plant"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Plants Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {paginatedPlants.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <p>
                {searchTerm
                  ? "No plants match your search."
                  : "No plants found. Add your first plant to get started!"}
              </p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Image
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Plant ID
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Name
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Price
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Stock
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Categories
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Rating
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "normal",
                            color: "#6b7280",
                            marginTop: "0.25rem",
                          }}
                        >
                          Customer Reviews
                        </div>
                      </th>
                      <th style={{ padding: "1rem", textAlign: "center" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPlants.map((plant) => (
                      <PlantRow
                        key={plant._id}
                        plant={plant}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "1rem",
                    borderTop: "1px solid #e5e7eb",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="btn btn-sm"
                    style={{
                      backgroundColor:
                        currentPage === 1 ? "#f3f4f6" : "#e5e7eb",
                      color: currentPage === 1 ? "#9ca3af" : "#374151",
                    }}
                  >
                    ← Previous
                  </button>

                  <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                    Page {currentPage} of {totalPages} ({filteredPlants.length}{" "}
                    total plants)
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
      </div>
    </div>
  );
};

export default AdminPlants;
