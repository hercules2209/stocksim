import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { MdDeleteOutline } from "react-icons/md";
import { fetchPortfolios, deletePortfolio } from '../../redux/portfolioSlice';
import { useUser } from 'reactfire';
import './PortfolioOverview.css';

const PortfolioOverview = () => {
  const dispatch = useDispatch();
  const { items: portfolios, status, error } = useSelector(state => state.portfolios);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const portfoliosPerPage = 5;

  // Use the useUser hook to get the current user
  const { data: user } = useUser();

  useEffect(() => {
    if (status === 'idle' && user) {
      dispatch(fetchPortfolios(user.displayName));
    }
  }, [status, dispatch, user]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

  const handleDelete = async (portfolioId) => {
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      try {
        await dispatch(deletePortfolio({ id: portfolioId, username: user.displayName })).unwrap();
      } catch (error) {
        console.error('Failed to delete the portfolio:', error);
      }
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedPortfolios = [...portfolios].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastPortfolio = currentPage * portfoliosPerPage;
  const indexOfFirstPortfolio = indexOfLastPortfolio - portfoliosPerPage;
  const currentPortfolios = sortedPortfolios.slice(indexOfFirstPortfolio, indexOfLastPortfolio);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (!user) {
    return <div>Please log in to view your portfolios.</div>;
  }

  return (
    <div className="portfolio-overview">
      <h2>Your Portfolios</h2>
      <Link to="/create-portfolio" className="create-portfolio-btn">
        <i className="fas fa-plus"></i> Create New Portfolio
      </Link>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Portfolio Name</th>
            <th onClick={() => handleSort('creationDate')}>Creation Date</th>
            <th onClick={() => handleSort('totalInvested')}>Total Invested</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPortfolios.map((portfolio) => (
            <tr key={portfolio._id}>
              <td>
                <Link to={`/portfolios/${portfolio._id}`}>{portfolio.name}</Link>
              </td>
              <td>{new Date(portfolio.creationDate).toLocaleDateString()}</td>
              <td>${portfolio.totalInvested.toFixed(2)}</td>
              <td>
                <button className="delete-button" onClick={() => handleDelete(portfolio._id)}>
                  <MdDeleteOutline className="delete-icon"/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from({ length: Math.ceil(portfolios.length / portfoliosPerPage) }, (_, i) => (
          <button key={i} onClick={() => paginate(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PortfolioOverview;