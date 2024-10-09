import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getMarketStatus, getMarketHolidays, getMarketNews } from '../../utils/api';
import NewsCard from '../News/NewsCard';
import "./home.css";

const Home = () => {
  const [marketStatus, setMarketStatus] = useState(null);
  const [marketHolidays, setMarketHolidays] = useState(null);
  const [marketNews, setMarketNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();
  const lastNewsElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [status, holidays] = await Promise.all([
          getMarketStatus('US'),
          getMarketHolidays('US'),
        ]);
        setMarketStatus(status);
        setMarketHolidays(holidays);
      } catch (err) {
        setError('Failed to fetch market data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const news = await getMarketNews('general', page);
        setMarketNews(prevNews => {
          const newNews = news.filter(item => !prevNews.some(existing => existing.id === item.id));
          return [...prevNews, ...newNews];
        });
        setHasMore(news.length > 0);
      } catch (err) {
        setError('Failed to fetch market news');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [page]);

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="home-content">
      <h1>Welcome to StockSim</h1>
      <div className="market-info-container">
        <section className="market-status">
          <h2>Market Status</h2>
          {marketStatus && (
            <div className="status-details">
              <p><strong>Exchange:</strong> {marketStatus.exchange}</p>
              <p><strong>Is Open:</strong> {marketStatus.isOpen ? 'Yes' : 'No'}</p>
              <p><strong>Session:</strong> {marketStatus.session}</p>
              <p><strong>Timezone:</strong> {marketStatus.timezone}</p>
            </div>
          )}
        </section>
        <section className="market-holidays">
          <h2>Upcoming Market Holidays</h2>
          {marketHolidays && marketHolidays.data && (
            <ul className="holiday-list">
              {marketHolidays.data.slice(0, 5).map((holiday, index) => (
                <li key={`holiday-${index}`}>
                  <strong>{holiday.eventName}</strong> - {holiday.atDate}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <section className="market-news">
        <h2>Latest Market News</h2>
        <div className="news-grid">
          {marketNews.map((news, index) => (
            <div 
              key={`news-${news.id || news.headline || index}`} 
              ref={index === marketNews.length - 1 ? lastNewsElementRef : null}
            >
              <NewsCard news={news} />
            </div>
          ))}
        </div>
        {loading && <div className="loading">Loading more news...</div>}
      </section>
    </div>
  );
}

export default Home;