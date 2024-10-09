import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPortfolioById } from '../../redux/portfolioSlice';
import { getStockDetails } from '../../utils/api';
import { FaArrowCircleUp, FaArrowCircleDown, FaStopCircle } from "react-icons/fa";
import { MdOutlineEdit } from "react-icons/md";
import logo from '../../assets/images/logo-universal.png';
import './PortfolioDetail.css';

const PortfolioDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const portfolio = useSelector((state) => state.portfolios.currentPortfolio);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stocks');
  const [stockPrices, setStockPrices] = useState({});
  const [stockLogos, setStockLogos] = useState({});

  useEffect(() => {
    dispatch(fetchPortfolioById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (portfolio && portfolio.stocks) {
      portfolio.stocks.forEach(stock => {
        fetchCurrentPrice(stock.symbol);
      });
    }
  }, [portfolio]);

  const fetchCurrentPrice = async (symbol) => {
    try {
      const stockDetails = await getStockDetails(symbol);
      setStockLogos(prevLogos => ({
        ...prevLogos,
        [symbol]: stockDetails.logo,
      }));
      setStockPrices(prevPrices => ({
        ...prevPrices,
        [symbol]: stockDetails.currentPrice,
      }));
    } catch (error) {
      console.error(`Error fetching stock details for ${symbol}:`, error);
      setError(`Failed to fetch current price for ${symbol}`);
    }
  };

  const calculateProfitLoss = (purchasePrice, currentPrice, quantity) => {
    return (currentPrice - purchasePrice) * quantity;
  };

  const getTrendIcon = (profitLoss) => {
    if (profitLoss > 0) return <FaArrowCircleUp className="trend-icon up" />;
    if (profitLoss < 0) return <FaArrowCircleDown className="trend-icon down" />;
    return <FaStopCircle className="trend-icon neutral" />;
  };

  if (!portfolio) return <div>Loading portfolio...</div>;
  if (error) return <div>{error}</div>;

  const totalProfitLoss = portfolio.stocks.reduce((acc, stock) => {
    const currentPrice = stockPrices[stock.symbol] || stock.purchasePrice;
    return acc + calculateProfitLoss(stock.purchasePrice, currentPrice, stock.quantity);
  }, 0);

  const renderStocks = () => (
    <table>
      <thead>
        <tr>
          <th>Logo</th>
          <th>Stock Name</th>
          <th>Current Price</th>
          <th>Bought At</th>
          <th>Quantity</th>
          <th>Total Invested</th>
          <th>Current Profit/Loss</th>
          <th>Trend</th>
        </tr>
      </thead>
      <tbody>
        {portfolio.stocks.map((stock) => {
          const currentPrice = stockPrices[stock.symbol] || stock.purchasePrice;
          const profitLoss = calculateProfitLoss(stock.purchasePrice, currentPrice, stock.quantity);
          const logoUrl = stockLogos[stock.symbol];

          return (
            <tr key={stock._id}>
              <td>
                {logoUrl ? (
                  <img src={logoUrl} alt={`${stock.name} logo`} className="stock-logo" />
                ) : (
                  //show default logo if not available
                  <img src={logo} alt={`${stock.name} logo`} className="stock-logo" />
                )}
              </td>
              <td>
                <Link to={`/stock/${stock.symbol}`}>{stock.name}</Link>
              </td>
              <td>${currentPrice.toFixed(2)}</td>
              <td>${stock.purchasePrice.toFixed(2)}</td>
              <td>{stock.quantity}</td>
              <td>${(stock.purchasePrice * stock.quantity).toFixed(2)}</td>
              <td>${profitLoss.toFixed(2)}</td>
              <td>{getTrendIcon(profitLoss)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const renderTransactions = () => (
    <table>
      <thead>
        <tr>
          <th>Transaction Type</th>
          <th>Symbol</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {portfolio.transactions.map((transaction) => (
          <tr key={transaction._id}>
            <td>
              <div className={`transaction-type ${transaction.type.toLowerCase()}`}>
                {transaction.type}
              </div>
            </td>
            <td>{transaction.symbol}</td>
            <td>{transaction.quantity}</td>
            <td>${transaction.price.toFixed(2)}</td>
            <td>{new Date(transaction.date).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="portfolio-detail">
      <h2 className='portfolio-name'><p>{portfolio.name}</p>
      <button className='edit-button' onClick={() => navigate(`/edit-portfolio/${portfolio._id}`)}>
      <MdOutlineEdit />
      </button>
      </h2>
      <p>Total Invested: ${portfolio.totalInvested.toFixed(2)}</p>
      <p>Total Profit/Loss: ${totalProfitLoss.toFixed(2)} {getTrendIcon(totalProfitLoss)}</p>

      <div className="tab-container">
        <button
          className={`tab ${activeTab === 'stocks' ? 'active' : ''}`}
          onClick={() => setActiveTab('stocks')}
        >
          Stocks
        </button>
        <button
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
      </div>

      {activeTab === 'stocks' ? renderStocks() : renderTransactions()}
    </div>
  );
};

export default PortfolioDetail;
