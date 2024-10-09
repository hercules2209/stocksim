import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPortfolio } from '../../redux/portfolioSlice';
import SearchBar from '../stock/SearchBar';
import { getStockSuggestions, getStockDetails } from '../../utils/api';
import './CreatePortfolio.css';

const CreatePortfolio = () => {
  const [portfolioName, setPortfolioName] = useState('');
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Read username from localStorage
  const username = localStorage.getItem('username');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!portfolioName.trim()) {
      setError('Portfolio name cannot be empty');
      return;
    }
    if (selectedStocks.some(stock => stock.quantity === 0)) {
      setError('All stocks must have a quantity greater than zero');
      return;
    }
    try {
      const resultAction = await dispatch(createPortfolio({
        name: portfolioName,
        stocks: selectedStocks.map(stock => ({
          name: stock.name,
          symbol: stock.symbol,
          quantity: stock.quantity,
          purchasePrice: stock.currentPrice
        })),
        username // Pass the username into the action
      }));
      
      const newPortfolio = resultAction.payload;
      navigate(`/portfolios/${newPortfolio._id}`);
    } catch (err) {
      setError('Failed to create portfolio. Please try again.');
    }
  };

  const handleStockSelect = async (symbol) => {
    setIsLoading(true);
    setError(null);
    try {
      const stockDetails = await getStockDetails(symbol);
      if (!selectedStocks.some(stock => stock.symbol === symbol)) {
        setSelectedStocks(prev => [...prev, {
          symbol: symbol,
          name: stockDetails.name || symbol,
          logo: stockDetails.logo || '',
          currentPrice: stockDetails.currentPrice || 0,
          previousClose: stockDetails.previousClose || 0,
          quantity: 0,
        }]);
      }
    } catch (error) {
      // console.error('Error fetching stock details:', error);
      setError('Failed to fetch stock details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (symbol, quantity) => {
    setSelectedStocks(selectedStocks.map(stock =>
      stock.symbol === symbol ? { ...stock, quantity: parseInt(quantity) || 0 } : stock
    ));
  };

  const removeStock = (symbol) => {
    setSelectedStocks(selectedStocks.filter(stock => stock.symbol !== symbol));
  };

  return (
    <div className="create-portfolio">
      <h2>Create New Portfolio</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="portfolioName">Portfolio Name:</label>
          <input
            type="text"
            id="portfolioName"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            required
          />
        </div>
        <div>
          <h3>Add Stocks to Portfolio:</h3>
          <SearchBar onSearch={handleStockSelect} onAutoComplete={getStockSuggestions} />
        </div>
        {isLoading && <div>Loading stock details...</div>}
        {selectedStocks.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Symbol</th>
                <th>Current Price</th>
                <th>Previous Close</th>
                <th>Quantity</th>
                <th>Investment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedStocks.map(stock => (
                <tr key={stock.symbol}>
                  <td><img src={stock.logo} alt={stock.name} width="40" height="40" /></td>
                  <td>{stock.name}</td>
                  <td>{stock.symbol}</td>
                  <td>${stock.currentPrice.toFixed(2)}</td>
                  <td>${stock.previousClose.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      value={stock.quantity}
                      onChange={(e) => handleQuantityChange(stock.symbol, e.target.value)}
                      min="0"
                    />
                  </td>
                  <td>${(stock.quantity * stock.currentPrice).toFixed(2)}</td>
                  <td>
                    <button type="button" className="remove-stock" onClick={() => removeStock(stock.symbol)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="button-group">
          <button type="submit">Create Portfolio</button>
          <button type="button" onClick={() => navigate('/portfolios')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreatePortfolio;
