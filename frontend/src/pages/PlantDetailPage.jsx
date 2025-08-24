import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./PlantDetailPage.css";

const PlantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, updateCartItem, items } = useCart();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPlant();
  }, [id]);

  // Initialize quantity to current cart quantity when plant and cart items are available
  useEffect(() => {
    if (plant && items) {
      const cartItem = items.find((item) => item.plantId._id === plant._id);
      if (cartItem) {
        // Set quantity to current cart quantity so user can see and modify total
        setQuantity(cartItem.quantity);
      } else {
        setQuantity(1);
      }
    }
  }, [plant, items]);

  // Reset quantity if it exceeds available stock
  useEffect(() => {
    if (plant) {
      const availableStock = getAvailableStock();
      if (quantity > availableStock && availableStock > 0) {
        setQuantity(Math.max(1, availableStock));
      } else if (availableStock === 0) {
        setQuantity(1);
      }
    }
  }, [items, plant]);

  const fetchPlant = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/plants/${id}`
      );
      setPlant(response.data.plant);
    } catch (error) {
      setError("Plant not found");
      console.error("Error fetching plant:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate available stock (total stock - items already in cart)
  const getAvailableStock = () => {
    if (!plant) return 0;

    const cartItem = items.find((item) => item.plantId._id === plant._id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    return Math.max(0, plant.stock - quantityInCart);
  };

  // Get quantity already in cart
  const getQuantityInCart = () => {
    const cartItem = items.find((item) => item.plantId._id === plant._id);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const cartItem = items.find((item) => item.plantId._id === plant._id);
    let result;

    if (cartItem) {
      // Item exists in cart, update the quantity to the new total
      result = await updateCartItem(plant._id, quantity);
      if (result.success) {
        setMessage("Cart updated successfully");
      }
    } else {
      // Item doesn't exist in cart, add it
      result = await addToCart(plant._id, quantity);
      if (result.success) {
        setMessage(result.message);
      }
    }

    if (result.success) {
      setMessage(cartItem ? "Cart updated successfully" : result.message);
      // Redirect to cart page after a short delay to show the success message
      setTimeout(() => {
        navigate("/cart");
      }, 1000);
    } else {
      setError(result.message);
      setTimeout(() => setError(""), 3000);
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

  if (error && !plant) {
    return (
      <div
        className="container"
        style={{ padding: "2rem 0", textAlign: "center" }}
      >
        <h2>Plant Not Found</h2>
        <p>{error}</p>
        <Link to="/catalog" className="btn btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  if (!plant) return null;

  return (
    <div className="container plant-detail-container">
      <div>
        <Link to="/catalog" className="back-link">
          ← Back to Catalog
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="plant-detail-grid">
        {/* Plant Image */}
        <div>
          <div className="plant-image-container">
            {plant.image ? (
              <img src={plant.image} alt={plant.name} className="plant-image" />
            ) : (
              <span style={{ fontSize: "6rem" }}>🌱</span>
            )}
          </div>
        </div>

        {/* Plant Details */}
        <div className="plant-info">
          <h1 className="plant-title">{plant.name}</h1>

          {/* Plant ID */}
          {plant.plantId && (
            <div
              style={{
                backgroundColor: "#f0f9ff",
                border: "1px solid #0ea5e9",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#0369a1",
                marginBottom: "1rem",
                width: "fit-content",
              }}
            >
              🌱 Plant ID: {plant.plantId}
            </div>
          )}

          {/* Price */}
          <div className="price-section">
            <span className="current-price">₹{plant.price}</span>
            {plant.originalPrice && plant.originalPrice > plant.price && (
              <>
                <span className="original-price">₹{plant.originalPrice}</span>
                <span className="savings-badge">
                  Save ₹{plant.originalPrice - plant.price}
                </span>
              </>
            )}
          </div>

          {/* Rating */}
          <div className="rating-section">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  style={{ color: i < plant.rating ? "#fbbf24" : "#d1d5db" }}
                >
                  ⭐
                </span>
              ))}
            </div>
            <span className="rating-text">({plant.rating}/5)</span>
          </div>

          {/* Stock Status */}
          <div>
            {plant.stock > 0 ? (
              <div>
                <span
                  className={`stock-info ${
                    getAvailableStock() > 0
                      ? "stock-available"
                      : "stock-unavailable"
                  }`}
                >
                  {getAvailableStock() > 0
                    ? `${getAvailableStock()} available`
                    : "No more available"}
                </span>
                {getQuantityInCart() > 0 && (
                  <span className="stock-details">
                    ({getQuantityInCart()} in cart, {plant.stock} total stock)
                  </span>
                )}
                {getQuantityInCart() === 0 && (
                  <span className="stock-details">
                    ({plant.stock} total stock)
                  </span>
                )}
              </div>
            ) : (
              <span className="stock-info stock-unavailable">Out of stock</span>
            )}
          </div>

          {/* Categories */}
          {plant.categories && plant.categories.length > 0 && (
            <div className="categories-section">
              <strong>Categories: </strong>
              {plant.categories.map((category) => (
                <span key={category} className="category-badge">
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Add to Cart */}
          {plant.stock > 0 && (
            <div className="add-to-cart-section">
              {getAvailableStock() > 0 ? (
                <>
                  <div className="quantity-controls">
                    <label className="quantity-label">Quantity:</label>
                    <div className="quantity-input-group">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="quantity-btn"
                        type="button"
                      >
                        -
                      </button>
                      <span
                        className={`quantity-display ${
                          quantity > plant.stock ? "quantity-error" : ""
                        }`}
                      >
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(plant.stock, quantity + 1))
                        }
                        className="quantity-btn"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    {quantity > plant.stock && (
                      <span className="quantity-warning">
                        Exceeds available stock
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%" }}
                  >
                    {!isAuthenticated
                      ? "Login to Add to Cart"
                      : getQuantityInCart() > 0
                      ? "Update Cart"
                      : "Add to Cart"}
                  </button>
                </>
              ) : (
                <div className="cart-full-message">
                  <p style={{ margin: 0 }}>
                    You have added all available items to your cart.
                    {getQuantityInCart() > 0 && (
                      <span style={{ display: "block", fontSize: "0.9rem" }}>
                        Check your cart to modify quantity or complete your
                        purchase.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="description-section">
            <h3>Description</h3>
            <p className="description-text">{plant.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetailPage;
