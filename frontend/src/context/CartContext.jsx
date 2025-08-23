import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ITEM_LOADING":
      return {
        ...state,
        itemLoading: {
          ...state.itemLoading,
          [action.payload.plantId]: action.payload.loading,
        },
      };
    case "OPTIMISTIC_UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.plantId._id === action.payload.plantId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: calculateTotal(
          state.items.map((item) =>
            item.plantId._id === action.payload.plantId
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
        ),
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
        loading: false,
      };
    default:
      return state;
  }
};

const calculateTotal = (items) => {
  return items.reduce(
    (acc, item) => acc + item.plantId.price * item.quantity,
    0
  );
};

const initialState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  itemLoading: {}, // Track loading state per item
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();
  const debounceTimers = useRef({});

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      dispatch({ type: "CLEAR_CART" });
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/cart`);
      dispatch({
        type: "SET_CART",
        payload: response.data.cart,
      });
    } catch (error) {
      console.error("Load cart error:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load cart" });
    }
  };

  const addToCart = async (plantId, quantity = 1) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/cart/add`,
        {
          plantId,
          quantity,
        }
      );

      dispatch({
        type: "SET_CART",
        payload: response.data.cart,
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add to cart";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, message };
    }
  };

  const updateCartItem = async (plantId, quantity, showLoading = true) => {
    // Optimistic update - update UI immediately
    dispatch({
      type: "OPTIMISTIC_UPDATE_QUANTITY",
      payload: { plantId, quantity },
    });

    // Set loading for specific item only if requested
    if (showLoading) {
      dispatch({
        type: "SET_ITEM_LOADING",
        payload: { plantId, loading: true },
      });
    }

    dispatch({ type: "CLEAR_ERROR" });

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/cart/update/${plantId}`,
        {
          quantity,
        }
      );

      // Update with server response to ensure consistency
      dispatch({
        type: "SET_CART",
        payload: response.data.cart,
      });

      return { success: true };
    } catch (error) {
      // Revert optimistic update on error by fetching fresh cart data
      loadCart();
      const message = error.response?.data?.message || "Failed to update cart";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, message };
    } finally {
      // Clear item loading state only if we were showing it
      if (showLoading) {
        dispatch({
          type: "SET_ITEM_LOADING",
          payload: { plantId, loading: false },
        });
      }
    }
  };
  const removeFromCart = async (plantId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/cart/remove/${plantId}`
      );

      dispatch({
        type: "SET_CART",
        payload: response.data.cart,
      });

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to remove from cart";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, message };
    }
  };

  const clearCart = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/cart/clear`);
      dispatch({ type: "CLEAR_CART" });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to clear cart";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, message };
    }
  };

  const getCartItemsCount = () => {
    return state.items.length; // Count unique items, not total quantity
  };

  // Debounced update function
  const updateCartItemDebounced = (plantId, quantity) => {
    // Clear existing timer for this item
    if (debounceTimers.current[plantId]) {
      clearTimeout(debounceTimers.current[plantId]);
    }

    // Immediate optimistic update
    dispatch({
      type: "OPTIMISTIC_UPDATE_QUANTITY",
      payload: { plantId, quantity },
    });

    // Debounced server update without loading indicators
    debounceTimers.current[plantId] = setTimeout(() => {
      updateCartItem(plantId, quantity, false);
    }, 500); // 500ms delay
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateCartItem,
        updateCartItemDebounced,
        removeFromCart,
        clearCart,
        loadCart,
        getCartItemsCount,
        clearError: () => dispatch({ type: "CLEAR_ERROR" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
