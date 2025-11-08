// src/features/products/productsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
  },
  reducers: {
    setProducts: (state, action) => {
      state.list = action.payload;
    },
    updateProductStockRedux: (state, action) => {
      const { id, stock } = action.payload;
      const product = state.list.find((p) => p.id === id);
      if (product) product.stock = stock;
    },
    decreaseStock: (state, action) => {
      const id = action.payload;
      const product = state.list.find((p) => p.id === id);
      if (product && product.stock > 0) product.stock--;
    },
  },
});

export const { setProducts, updateProductStockRedux, decreaseStock } =
  productsSlice.actions;

export default productsSlice.reducer;
