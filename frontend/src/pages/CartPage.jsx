import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./CartPage.css";

const CartPage = () => {
  const { items, total, loading, error, updateCartItem, removeFromCart } =
    useCart();
  const [message, setMessage] = useState("");

  const handleUpdateQuantity = async (plantId, quantity) => {
    if (quantity < 1) return;

    const result = await updateCartItem(plantId, quantity);
    if (result.success) {
      setMessage("Cart updated");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleRemoveItem = async (plantId) => {
    const result = await removeFromCart(plantId);
    if (result.success) {
      setMessage("Item removed");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/catalog" className="btn">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          {/* Left Side - Items List */}
          <div className="cart-items-section">
            <h2>Items in Cart</h2>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.plantId._id} className="cart-item">
                  <div className="item-image">
                    {item.plantId.image ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL.replace(
                          "/api",
                          ""
                        )}/uploads/${item.plantId.image}`}
                        alt={item.plantId.name}
                      />
                    ) : (
                      <div className="placeholder">🌱</div>
                    )}
                  </div>

                  <div className="item-details">
                    <h3>{item.plantId.name}</h3>
                    <p className="price">₹{item.plantId.price}</p>
                  </div>

                  <div className="item-quantity">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.plantId._id,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.plantId._id,
                          item.quantity + 1
                        )
                      }
                      disabled={item.quantity >= item.plantId.stock}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    ₹{item.plantId.price * item.quantity}
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.plantId._id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Bill Summary */}
          <div className="cart-summary-section">
            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal ({items.length} items):</span>
                  <span>₹{total}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>₹0</span>
                </div>
                <hr />
                <div className="summary-row total-row">
                  <span>
                    <strong>Total:</strong>
                  </span>
                  <span>
                    <strong>₹{total}</strong>
                  </span>
                </div>
              </div>

              <div className="actions">
                <Link to="/checkout" className="btn primary checkout-btn">
                  Proceed to Checkout
                </Link>
                <Link to="/catalog" className="btn secondary continue-btn">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
