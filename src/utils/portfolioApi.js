// src/utils/portfolioApi.js
const API_URL = 'https://asia-south1-stocksim-432707.cloudfunctions.net/api';

export const getAllPortfolios = async (username) => {
  const response = await fetch(`${API_URL}/portfolios/user/${username}`);
  if (!response.ok) throw new Error('Failed to fetch portfolios');
  return response.json();
};

export const getPortfolio = async (id) => {
  const response = await fetch(`${API_URL}/portfolios/${id}`);
  if (!response.ok) throw new Error('Failed to fetch portfolio');
  return response.json();
};

export const createPortfolio = async (portfolioData) => {
  const response = await fetch(`${API_URL}/portfolios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(portfolioData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create portfolio');
  }
  return response.json();
};

export const deletePortfolio = async (id, username) => { 
  const response = await fetch(`${API_URL}/portfolios/${id}`, { 
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username }),
  });
  if (!response.ok) throw new Error('Failed to delete portfolio');
  return response.json();
};


export const addStockToPortfolio = async (portfolioId, stock) => {
  const response = await fetch(`${API_URL}/portfolios/${portfolioId}/stocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stock),
  });
  if (!response.ok) throw new Error('Failed to add stock to portfolio');
  return response.json();
};


export const removeStockFromPortfolio = async (portfolioId, stockSymbol, quantity, sellPrice, purchaseDate) => {
  const response = await fetch(`${API_URL}/portfolios/${portfolioId}/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol: stockSymbol, quantity, sellPrice, purchaseDate }),  // Pass symbol and purchaseDate
  });
  if (!response.ok) throw new Error('Failed to remove stock from portfolio');
  return response.json();
};


