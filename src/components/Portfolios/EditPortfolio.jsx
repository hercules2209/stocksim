import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchPortfolioById,
  addStockToPortfolio,
  sellStockFromPortfolio,
} from '../../redux/portfolioSlice';
import { getStockSuggestions, getStockDetails } from '../../utils/api';
import SearchBar from '../stock/SearchBar';
import { FaArrowCircleLeft } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import './EditPortfolio.css';

const EditPortfolio = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const portfolio = useSelector((state) => state.portfolios.currentPortfolio);
  const [quantities, setQuantities] = useState({});
  const [tempStock, setTempStock] = useState(null); // Hold the searched stock temporarily
  const [error, setError] = useState(null);
  const [transactionType, setTransactionType] = useState('buy'); // 'buy' or 'sell'

  useEffect(() => {
    dispatch(fetchPortfolioById(id));
  }, [dispatch, id]);

  const handleAddStock = async (symbol) => {
    try {
      const stockDetails = await getStockDetails(symbol);
      const stock = {
        symbol: stockDetails.ticker,
        name: stockDetails.name,
        purchasePrice: stockDetails.currentPrice,
        purchaseDate: new Date(),
      };
      setTempStock(stock); // Store the stock details locally, but do not add it yet
    } catch (error) {
      console.error('Error fetching stock details:', error);
      setError('Failed to fetch stock details');
    }
  };

  // Adjust this function to handle both tempStock and existing portfolio stocks
  const handleQuantityChange = (symbol, quantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [symbol]: quantity, // Use symbol as the key for tempStock
    }));
  };

  const handleConfirmAddStock = () => {
    if (!tempStock || !quantities[tempStock.symbol]) {
      alert('Please enter a quantity to add the stock.');
      return;
    }

    const stockToAdd = { ...tempStock, quantity: parseInt(quantities[tempStock.symbol]) };
    dispatch(addStockToPortfolio({ portfolioId: id, stock: stockToAdd }));
    setTempStock(null); // Clear the temp stock after adding it
    setQuantities({}); // Reset the quantities
  };

  const handleTransaction = async () => {
    const stocksToProcess = Object.entries(quantities).filter(
      ([, quantity]) => parseInt(quantity) > 0
    );

    if (stocksToProcess.length === 0) {
      alert('Please enter quantities to process.');
      return;
    }

    for (let [symbol, quantity] of stocksToProcess) {
      quantity = parseInt(quantity);

      // Find the stock in the portfolio based on symbol
      const stock = portfolio.stocks.find((s) => s.symbol === symbol);

      if (!stock) {
        alert(`Stock not found for ${symbol}`);
        return;
      }

      // Check if the quantity to sell exceeds available stock
      if (transactionType === 'sell' && quantity > stock.quantity) {
        alert(`You cannot sell more than you own for ${stock.name}.`);
        return;
      }

      try {
        if (transactionType === 'buy') {
          const stockToBuy = { ...stock, quantity };
          await dispatch(addStockToPortfolio({ portfolioId: id, stock: stockToBuy }));
        } else if (transactionType === 'sell') {
          const sellPrice = stock.currentPrice || stock.purchasePrice;
          await dispatch(
            sellStockFromPortfolio({
              portfolioId: id,
              stockSymbol: stock.symbol,
              quantity,
              sellPrice,
              purchaseDate: stock.purchaseDate,
            })
          );
        }
      } catch (error) {
        console.error(`Error processing transaction for ${stock.name}:`, error);
        setError(`Failed to process transaction for ${stock.name}`);
      }
    }

    // Reset quantities after processing
    setQuantities({});
  };

  if (!portfolio) return <div>Loading portfolio...</div>;

  return (
    <div className="edit-portfolio">
      <h2>
        <button className='back-button' onClick={() => navigate(`/portfolios/${portfolio._id}`)}>
          <FaArrowCircleLeft />
        </button>
        Edit Portfolio: {portfolio.name}
      </h2>
  
      <div className="search-bar">
        <SearchBar onSearch={handleAddStock} onAutoComplete={getStockSuggestions} />
      </div>
  
      {tempStock && (
        <div className="temp-stock">
          <h3>{tempStock.name} (${tempStock.purchasePrice.toFixed(2)})</h3>
          <input
            type="number"
            value={quantities[tempStock.symbol] || 0}
            onChange={(e) => handleQuantityChange(tempStock.symbol, e.target.value)}
            min="1"
            placeholder="Quantity"
          />
          <button className='add-button' onClick={handleConfirmAddStock}>
            <IoIosAddCircleOutline />
          </button>
        </div>
      )}
  
      <table>
        <thead>
          <tr>
            <th>Stock Name</th>
            <th>Symbol</th>
            <th>Owned</th>
            <th>Price</th>
            <th>Purchase Date</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.stocks.map((stock) => {
            const key = `${stock.symbol}_${stock.purchaseDate}`;
            return (
              <tr key={key}>
                <td>{stock.name}</td>
                <td>{stock.symbol}</td>
                <td>{stock.quantity}</td>
                <td>${stock.purchasePrice.toFixed(2)}</td>
                <td>{new Date(stock.purchaseDate).toLocaleDateString()}</td>
                <td>
                  <input
                    type="number"
                    value={quantities[stock.symbol] || 0}
                    onChange={(e) => handleQuantityChange(stock.symbol, e.target.value)}
                    min="0"
                    max={transactionType === 'sell' ? stock.quantity : undefined}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
  
      <div className="transaction-controls">
        <div className="transaction-type">
          <label>
            <input
              type="radio"
              value="buy"
              checked={transactionType === 'buy'}
              onChange={() => setTransactionType('buy')}
            />
            Buy
          </label>
          <label>
            <input
              type="radio"
              value="sell"
              checked={transactionType === 'sell'}
              onChange={() => setTransactionType('sell')}
            />
            Sell
          </label>
        </div>
  
        <button className="transaction-button" onClick={handleTransaction}>
          {transactionType === 'buy' ? 'Buy Stocks' : 'Sell Stocks'}
        </button>
      </div>
  
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default EditPortfolio;
