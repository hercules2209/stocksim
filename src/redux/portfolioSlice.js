// src/redux/portfolioSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as portfolioApi from '../utils/portfolioApi';

export const fetchPortfolios = createAsyncThunk(
  'portfolios/fetchAll',
  async (username) => {
    const response = await portfolioApi.getAllPortfolios(username); // Pass the username
    return response;
  }
);

export const createPortfolio = createAsyncThunk(
  'portfolios/create',
  async (portfolioData) => {
    const response = await portfolioApi.createPortfolio(portfolioData);
    return response;
  }
);

export const deletePortfolio = createAsyncThunk(
  'portfolios/delete',
  async ({ id, username }) => { // Accept id and username
    await portfolioApi.deletePortfolio(id, username); // Pass username dynamically
    return id;
  }
);

export const fetchPortfolioById = createAsyncThunk(
  'portfolios/fetchById',
  async (id) => {
    const response = await portfolioApi.getPortfolio(id); // Fetch a specific portfolio by id
    return response;
  }
);


export const addStockToPortfolio = createAsyncThunk(
  'portfolios/addStock',
  async ({ portfolioId, stock }) => {
    const response = await portfolioApi.addStockToPortfolio(portfolioId, stock);
    return response;
  }
);

export const sellStockFromPortfolio = createAsyncThunk(
  'portfolios/sellStock',
  async ({ portfolioId, stockSymbol, quantity, sellPrice, purchaseDate }) => {
    const response = await portfolioApi.removeStockFromPortfolio(portfolioId, stockSymbol, quantity, sellPrice, purchaseDate);
    return response;
  }
);

const portfolioSlice = createSlice({
  name: 'portfolios',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    currentPortfolio: null, // Add this to store the current portfolio
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolios.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPortfolios.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPortfolios.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deletePortfolio.fulfilled, (state, action) => {
        state.items = state.items.filter(portfolio => portfolio._id !== action.payload);
      })
      .addCase(fetchPortfolioById.fulfilled, (state, action) => {
        state.currentPortfolio = action.payload;
      })
      .addCase(addStockToPortfolio.fulfilled, (state, action) => {
        state.currentPortfolio = action.payload;
      })
      .addCase(sellStockFromPortfolio.fulfilled, (state, action) => {
        state.currentPortfolio = action.payload;
      });
  },
});

export default portfolioSlice.reducer;
