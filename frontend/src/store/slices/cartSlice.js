// Redux slice for shopping cart state management
// Handles cart operations, item updates and optimistic UI updates
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper function to calculate total
const calculateTotal = (items) => {
  return items.reduce(
    (acc, item) => acc + item.plantId.price * item.quantity,
    0
  );
};

// Async thunks for cart operations
export const loadCart = createAsyncThunk(
  'cart/loadCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/cart`);
      return response.data.cart;
    } catch (error) {
      console.error("Load cart error:", error);
      return rejectWithValue("Failed to load cart");
    }
  }
);

export const addToCartAction = createAsyncThunk(
  'cart/addToCart',
  async ({ plantId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/cart/add`,
        { plantId, quantity }
      );
      return {
        cart: response.data.cart,
        message: response.data.message
      };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add to cart";
      return rejectWithValue(message);
    }
  }
);

export const updateCartItemAction = createAsyncThunk(
  'cart/updateCartItem',
  async ({ plantId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/cart/update/${plantId}`,
        { quantity }
      );
      return response.data.cart;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update cart";
      return rejectWithValue(message);
    }
  }
);

export const removeFromCartAction = createAsyncThunk(
  'cart/removeFromCart',
  async (plantId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/cart/remove/${plantId}`
      );
      return response.data.cart;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to remove from cart";
      return rejectWithValue(message);
    }
  }
);

export const clearCartAction = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/cart/clear`);
      return { items: [], total: 0 };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to clear cart";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  itemLoading: {}, // Track loading state per item
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setItemLoading: (state, action) => {
      state.itemLoading = {
        ...state.itemLoading,
        [action.payload.plantId]: action.payload.loading,
      };
    },
    optimisticUpdateQuantity: (state, action) => {
      state.items = state.items.map((item) =>
        item.plantId._id === action.payload.plantId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      state.total = calculateTotal(state.items);
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load cart cases
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to cart cases
      .addCase(addToCartAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAction.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart.items;
        state.total = action.payload.cart.total;
      })
      .addCase(addToCartAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update cart item cases
      .addCase(updateCartItemAction.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(updateCartItemAction.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove from cart cases
      .addCase(removeFromCartAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAction.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(removeFromCartAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear cart cases
      .addCase(clearCartAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCartAction.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.total = 0;
      })
      .addCase(clearCartAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setLoading,
  setItemLoading,
  optimisticUpdateQuantity,
  setError,
  clearError,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
