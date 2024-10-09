// stock.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getStockCandles, 
  getCompanyProfile, 
  getCompanyNews, 
  getRecommendationTrends, 
  getStockSuggestions,
  calculateIndicators
} from '../../utils/api';
import Chart from '../Chart/Chart';
import SearchBar from './SearchBar';
import NewsCard from '../News/NewsCard';
import TechnicalAnalysis from '../TechnicalAnalysis/TechnicalAnalysis';
import './stock.css';

function Stock() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticker, setTicker] = useState(id || '');
  const [timeRange, setTimeRange] = useState('1M');
  const [allStockData, setAllStockData] = useState([]);
  const [visibleStockData, setVisibleStockData] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [companyNews, setCompanyNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [technicalIndicators, setTechnicalIndicators] = useState({
    sma: [],
    ema: [],
    rsi: []
  });
  const [recommendationTrends, setRecommendationTrends] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [action, setAction] = useState('');
  const [activeIndicators, setActiveIndicators] = useState({
    sma: true,
    ema: false,
    rsi: false
  });

  const timeRanges = [
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '6M', days: 180 },
    { label: '1Y', days: 365 },
    { label: 'All', days: 9999 },
  ];

  const fetchData = async () => {
    if (!ticker) return;
    
    setLoading(true);
    setError('');
    
    try {
      const [candleData, profile, news, trends] = await Promise.all([
        getStockCandles(ticker),
        getCompanyProfile(ticker),
        getCompanyNews(ticker),
        getRecommendationTrends(ticker)
      ]);
      
      setAllStockData(candleData);
      setCompanyProfile(profile);
      setCompanyNews(news);
      setRecommendationTrends(trends);
  
      const indicators = calculateIndicators(candleData);
      setTechnicalIndicators(indicators);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const fetchIndicator = async (indicator) => {
    if (!ticker) return;

    setLoading(true);
    try {
      let data;
      switch (indicator) {
        case 'ema':
          data = await getEMA(ticker);
          break;
        case 'rsi':
          data = await getRSI(ticker);
          break;
        default:
          throw new Error('Invalid indicator');
      }
      setTechnicalIndicators(prevState => ({
        ...prevState,
        [indicator]: data
      }));
    } catch (err) {
      console.error(`Error fetching ${indicator}:`, err);
      setError(`Failed to fetch ${indicator}: ` + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const toggleIndicator = async (indicator) => {
    setActiveIndicators(prev => {
      const newState = { ...prev, [indicator]: !prev[indicator] };
      if (newState[indicator] && technicalIndicators[indicator].length === 0) {
        fetchIndicator(indicator);
      }
      return newState;
    });
  };

  const renderNewsCards = () => {
    if (!companyNews || companyNews.length === 0) return null;

    return (
      <div className="news-container">
        <h3 className="news-title">Recent Company News</h3>
        <div ref={newsRef} className="news-grid">
          {companyNews.map((news, index) => (
            <div key={index} >
              <NewsCard news={news} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const fetchMoreNews = async () => {
    setIsLoading(true);
    try {
      const newPage = page + 1;
      const newsData = await getCompanyNews(ticker, start.toISOString().split('T')[0], end.toISOString().split('T')[0], newPage);
      
      setCompanyNews(prevNews => [...prevNews, ...newsData]);
      setPage(newPage);
      setTotalPages(Math.ceil(newsData.length / 5));
      setHasMore(newPage < totalPages);
    } catch (err) {
      console.error('Error fetching more news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ticker) {
      fetchData();
      navigate(`/stock/${ticker}`);
    }
  }, [ticker, navigate]);

  useEffect(() => {
    if (id) {
      setTicker(id);
    }
  }, [id]);

  useEffect(() => {
    if (allStockData.length > 0) {
      const endDate = new Date(allStockData[allStockData.length - 1].time * 1000);
      const startDate = new Date(endDate);
      const days = timeRanges.find(r => r.label === timeRange)?.days || 9999;
      startDate.setDate(startDate.getDate() - days);

      const filteredData = allStockData.filter(
        candle => new Date(candle.time * 1000) >= startDate && new Date(candle.time * 1000) <= endDate
      );

      setVisibleStockData(filteredData);
    }
  }, [allStockData, timeRange]);

  const visibleIndicators = useMemo(() => {
    if (visibleStockData.length === 0) return technicalIndicators;

    const startTime = visibleStockData[0].time;
    const endTime = visibleStockData[visibleStockData.length - 1].time;

    return {
      sma: technicalIndicators.sma.filter(d => d.time >= startTime && d.time <= endTime),
      ema: technicalIndicators.ema.filter(d => d.time >= startTime && d.time <= endTime),
      rsi: technicalIndicators.rsi.filter(d => d.time >= startTime && d.time <= endTime),
    };
  }, [visibleStockData, technicalIndicators]);

  const currentPrice = useMemo(() => {
    return visibleStockData[visibleStockData.length - 1]?.close || 0;
  }, [visibleStockData]);

  const handleSearch = (newTicker) => {
    setTicker(newTicker);
  };

  const newsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) {
        fetchMoreNews();
      }
    }, { threshold: 1 });

    if (newsRef.current) {
      observer.observe(newsRef.current);
    }

    return () => {
      if (newsRef.current) {
        observer.unobserve(newsRef.current);
      }
    };
  }, [hasMore]);

  const handleAutoComplete = async (query) => {
    try {
      return await getStockSuggestions(query);
    } catch (error) {
      console.error('Error in autocomplete:', error);
      return [];
    }
  };

  return (
    <div className={`stock-container ${ticker ? 'with-data' : ''}`}>
      <div className="search-container">
        <SearchBar onSearch={handleSearch} onAutoComplete={handleAutoComplete} />
      </div>
      {ticker && (
        <>
          <div className="stock-header">
            <h2>{ticker}</h2>
            <div className="time-range-buttons">
              {timeRanges.map(range => (
                <button
                  key={range.label}
                  onClick={() => setTimeRange(range.label)}
                  className={`time-range-button ${timeRange === range.label ? 'active' : ''}`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
            
          {visibleStockData && visibleStockData.length > 0 && (
            <>
              <Chart 
                priceData={visibleStockData} 
                technicalIndicators={{
                  sma: visibleIndicators.sma,
                  ema: visibleIndicators.ema,
                  rsi: visibleIndicators.rsi
                }}
                activeIndicators={activeIndicators}
              />
              <div className="indicator-toggles">
                {Object.keys(activeIndicators).map(indicator => (
                  <label key={indicator}>
                    <input
                      type="checkbox"
                      checked={activeIndicators[indicator]}
                      onChange={() => toggleIndicator(indicator)}
                    />
                    {indicator.toUpperCase()}
                  </label>
                ))}
              </div>
              <TechnicalAnalysis 
                technicalIndicators={visibleIndicators} 
                recommendationTrends={recommendationTrends}
                currentPrice={visibleStockData[visibleStockData.length - 1]?.close}
              />
              <div className="buy-sell-buttons">
                <button onClick={() => navigate('/portfolios')} className="buy-button">Buy</button>
                <button onClick={() => navigate('/portfolios')} className="sell-button">Sell</button>
              </div>
            </>
          )}

{companyProfile && (
  <div className="company-profile">
    <div className="company-info-grid">
      <div className="company-header">
        {companyProfile.logo && <img className="company-logo" src={companyProfile.logo} alt="company logo" />}
        <h3 className="company-name">{companyProfile.name || 'N/A'}</h3>
        <p className="company-ticker">{companyProfile.ticker || 'N/A'}</p>
      </div>
      <div className="info-item right-align">
        <span className="info-value">{companyProfile.ipo || 'N/A'}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Country:</span>
        <span className="info-value">{companyProfile.country || 'N/A'}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Industry:</span>
        <span className="info-value">{companyProfile.finnhubIndustry || 'N/A'}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Currency:</span>
        <span className="info-value">{companyProfile.currency || 'N/A'}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Exchange:</span>
        <span className="info-value">{companyProfile.exchange || 'N/A'}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Market Cap:</span>
        <span className="info-value">{formatMarketCap(companyProfile.marketCapitalization)}</span>
      </div>
      <div className="company-website right-align">
        {companyProfile.weburl && (
          <a href={companyProfile.weburl} target="_blank" rel="noopener noreferrer">Company Website</a>
        )}
      </div>
    </div>
  </div>
)}

          {companyProfile && renderNewsCards()}
        </>
      )}
    </div>
  );
}

export default Stock;

function formatMarketCap(marketCap) {
  if (marketCap == null) return 'N/A';
  if (marketCap >= 1e12) {
    return (marketCap / 1e12).toFixed(2) + 'T';
  } else if (marketCap >= 1e9) {
    return (marketCap / 1e9).toFixed(2) + 'B';
  } else if (marketCap >= 1e6) {
    return (marketCap / 1e6).toFixed(2) + 'M';
  } else {
    return marketCap.toFixed(2);
  }
}