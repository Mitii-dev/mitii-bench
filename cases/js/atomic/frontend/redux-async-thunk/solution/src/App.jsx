import React, { useMemo } from "react";
import {
  configureStore,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("https://dummyjson.com/products");

      if (!response.ok) {
        return rejectWithValue("Failed to fetch products");
      }

      const data = await response.json();
      return data.products;
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

const createAppStore = () =>
  configureStore({
    reducer: {
      products: productsSlice.reducer,
    },
  });

function ProductList() {
  const dispatch = useDispatch();

  const { items, status, error } = useSelector((state) => state.products);

  return (
    <main>
      <h1>Products</h1>

      <p data-testid="thunk-status">{status}</p>

      <button
        type="button"
        onClick={() => dispatch(fetchProducts())}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Loading..." : "Load Products"}
      </button>

      {error && <p role="alert">{error}</p>}

      <ul data-testid="thunk-data-list">
        {items.map((product) => (
          <li key={product.id}>
            <span>{product.title}</span>
            {" - "}
            <span>${product.price}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function App() {
  const store = useMemo(() => createAppStore(), []);

  return (
    <Provider store={store}>
      <ProductList />
    </Provider>
  );
}
