// TechnicalAnalysis.jsx
import React, { useState } from 'react';
import { FaArrowCircleUp, FaArrowCircleDown, FaStopCircle } from "react-icons/fa";
import { IoHelpCircleOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';
import './TechnicalAnalysis.css';

function TechnicalAnalysis({ technicalIndicators, recommendationTrends, currentPrice }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const getRecommendation = () => {
    if (!recommendationTrends || recommendationTrends.length === 0) return 'No recommendation available';
    const latestTrend = recommendationTrends[0];
    const totalRecommendations = latestTrend.strongBuy + latestTrend.buy + latestTrend.hold + latestTrend.sell + latestTrend.strongSell;
    const buyPercentage = (latestTrend.strongBuy + latestTrend.buy) / totalRecommendations * 100;

    if (buyPercentage > 60) return 'Strong Buy';
    if (buyPercentage > 50) return 'Buy';
    if (buyPercentage > 40) return 'Hold';
    if (buyPercentage > 30) return 'Sell';
    return 'Strong Sell';
  };

  const getLatestIndicatorValues = () => ({
    sma: technicalIndicators.sma[technicalIndicators.sma.length - 1]?.value,
    ema: technicalIndicators.ema[technicalIndicators.ema.length - 1]?.value,
    rsi: technicalIndicators.rsi[technicalIndicators.rsi.length - 1]?.value,
  });

  const latestValues = getLatestIndicatorValues();

  const getTrendIcon = (indicator, value) => {
    if (indicator === 'rsi') {
      return value > 70 ? <FaArrowCircleUp className="trend-icon up" /> : value < 30 ? <FaArrowCircleDown className="trend-icon down" /> : <FaStopCircle className="trend-icon neutral" />;
    } else {
      return currentPrice > value ? <FaArrowCircleUp className="trend-icon up" /> : currentPrice < value ? <FaArrowCircleDown className="trend-icon down" /> : <FaStopCircle className="trend-icon neutral" />;
    }
  };

  const getTooltipContent = (indicator) => {
    const tooltipData = {
      sma: `Simple Moving Average (SMA): ${latestValues.sma.toFixed(2)}\nThe SMA is the average price over a specific period.\nCurrent trend: ${currentPrice > latestValues.sma ? 'Bullish' : 'Bearish'}`,
      ema: `Exponential Moving Average (EMA): ${latestValues.ema.toFixed(2)}\nThe EMA gives more weight to recent prices.\nCurrent trend: ${currentPrice > latestValues.ema ? 'Bullish' : 'Bearish'}`,
      rsi: `Relative Strength Index (RSI): ${latestValues.rsi.toFixed(2)}\nRSI measures the speed and change of price movements.\nCondition: ${latestValues.rsi > 70 ? 'Overbought' : latestValues.rsi < 30 ? 'Oversold' : 'Neutral'}`,
    };
    return tooltipData[indicator];
  };

  const recommendation = getRecommendation();

  return (
    <div className="technical-analysis">
      <div className="recommendation-container">
        <h3>Recommendation</h3>
        <div className={`recommendation ${recommendation.toLowerCase().replace(' ', '-')}`}>
          {recommendation}
        </div>
      </div>
      <div className="indicators-grid">
        <div className="indicator-item">
          <h4>Current Price</h4>
          <p>${currentPrice.toFixed(2)}</p>
        </div>
        {['sma', 'ema', 'rsi'].map((indicator) => (
          <div key={indicator} className="indicator-item" onMouseEnter={() => setActiveTooltip(indicator)} onMouseLeave={() => setActiveTooltip(null)}>
            <h4>{indicator.toUpperCase()}</h4>
            <p>{indicator !== 'rsi' ? '$' : ''}{latestValues[indicator].toFixed(2)}</p>
            {getTrendIcon(indicator, latestValues[indicator])}
            {activeTooltip === indicator && <div className="tooltip">{getTooltipContent(indicator)}</div>}
          </div>
        ))}
      </div>
      <Link to="/learn" className="help-icon">
        <IoHelpCircleOutline />
      </Link>
    </div>
  );
}

export default TechnicalAnalysis;