import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    nextId: 1,
  },
  reducers: {
    addItem: (state) => {
      state.items.push({ id: state.nextId });
      state.nextId += 1;
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addItem, removeItem } = cartSlice.actions;

const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
  },
});

function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const cartCount = items.length;

  return (
    <main>
      <h1>Shopping Cart</h1>

      <p data-testid="cart-count">{cartCount}</p>

      <button data-testid="add-to-cart-btn" onClick={() => dispatch(addItem())}>
        Add to Cart
      </button>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            Item {item.id}
            <button onClick={() => dispatch(removeItem(item.id))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function App() {
  const store = configureStore({
    reducer: {
      cart: cartSlice.reducer,
    },
  });

  return (
    <Provider store={store}>
      <Cart />
    </Provider>
  );
}
