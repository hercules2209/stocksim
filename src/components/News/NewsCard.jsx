// src/components/NewsCard.jsx
import React from 'react';
import './NewsCard.css';

const NewsCard = ({ news }) => {
  return (
    <div className="news-card">
      <h3 className="news-headline">{news.headline}</h3>
      <p className="news-summary">{news.summary}</p>
      {news.image && <img src={news.image} alt={news.headline} className="news-image" />}
      <div className="news-footer">
        <span className="news-source">{news.source}</span>
        <a href={news.url} target='__blank' className="read-more">Read More</a>
      </div>
    </div>
  );
};

export default NewsCard;