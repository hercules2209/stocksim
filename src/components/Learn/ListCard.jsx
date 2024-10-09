// src/components/Learn/ListCard.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ListCard.css';

const ListCard = ({ article, onExpand }) => {
  // console.log(article);
  return (
    <div className="list-card" onClick={() => onExpand(article)}>
      <h3 className="article-title">{article.title}</h3>
      <div className="article-summary">
        <ReactMarkdown>{article.summary}</ReactMarkdown>
      </div>
      <div className="article-footer">
        <span className="article-author">By {article.author}</span>
        <span className="article-date">{new Date(article.createdAt).toLocaleDateString()}</span>
        <span className="read-more">Read More</span>
      </div>
    </div>
  );
};

export default ListCard;