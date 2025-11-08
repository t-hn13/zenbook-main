// src/features/cart/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
  },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload;
    },
    addToCartRedux: (state, action) => {
      const item = action.payload;
      const found = state.items.find((i) => i.id === item.id);
      if (found) {
        found.quantity += 1;
      } else {
        state.items.push({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          quantity: 1,
        });
      }
    },
  },
});

export const { setCart, addToCartRedux } = cartSlice.actions;
export default cartSlice.reducer;
