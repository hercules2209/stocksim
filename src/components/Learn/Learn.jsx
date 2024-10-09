// src/components/Learn/Learn.jsx
import React, { useState, useEffect } from 'react';
import { getAllArticles } from '../../utils/api';
import ListCard from './ListCard';
import ReactMarkdown from 'react-markdown';
import './Learn.css';

function Learn() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedArticle, setExpandedArticle] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const fetchedArticles = await getAllArticles();
        setArticles(fetchedArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExpand = (article) => {
    setExpandedArticle(article);
  };

  const handleClose = () => {
    setExpandedArticle(null);
  };

  return (
    <div className="learn-container">
      <h1>Learn About Stock Indicators</h1>
      <input
        type="text"
        placeholder="Search articles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="article-grid">
        {filteredArticles.map(article => (
          <ListCard
            key={article.title}
            article={article}
            onExpand={handleExpand}
          />
        ))}
      </div>
      {expandedArticle && (
        <div className="article-popup">
          <div className="article-popup-content">
            <div className="article-popup-text">
            <button className="close-button" onClick={handleClose}>×</button>
            <article className="full-article">
                <h2 className="article-popup-title">{expandedArticle.title}</h2>
                <div className="article-popup-meta">
                  <span className="article-popup-author">By {expandedArticle.author}</span>
                  <span className="article-popup-date">
                    Created: {new Date(expandedArticle.createdAt).toLocaleDateString()}
                    {expandedArticle.updatedAt && ` (Updated: ${new Date(expandedArticle.updatedAt).toLocaleDateString()})`}
                  </span>
                </div>
                <div><ReactMarkdown>{expandedArticle.content}</ReactMarkdown></div>
            </article>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Learn;