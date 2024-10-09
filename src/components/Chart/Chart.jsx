import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import './Chart.css';

function Chart({ priceData, technicalIndicators, activeIndicators }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartContainerRef.current && priceData.length > 0) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'white' },
          textColor: 'black',
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
      });

      candleSeries.setData(priceData);

      const indicatorSeries = {
        sma: chart.addLineSeries({ color: 'blue', lineWidth: 2 }),
        ema: chart.addLineSeries({ color: 'red', lineWidth: 2 }),
        macd: {
          macd: chart.addLineSeries({ color: 'blue', lineWidth: 2 }),
          signal: chart.addLineSeries({ color: 'red', lineWidth: 2 }),
          histogram: chart.addHistogramSeries({ color: 'green' })
        },
        rsi: chart.addLineSeries({ color: 'purple', lineWidth: 2 }),
      };

      chartRef.current = {
        chart,
        candleSeries,
        indicatorSeries,
      };

      // Add MACD to a separate pane
      const macdPane = chart.addLineSeries({
        color: 'blue',
        lineWidth: 2,
        pane: 1,
      });

      chart.applyOptions({
        rightPriceScale: {
          scaleMargins: {
            top: 0.1,
            bottom: 0.3,
          },
        },
      });

      return () => {
        chart.remove();
      };
    }
  }, [priceData]);

  useEffect(() => {
    if (chartRef.current && technicalIndicators) {
      const { sma, ema, rsi } = chartRef.current.indicatorSeries;

      if (activeIndicators.sma && technicalIndicators.sma.length > 0) {
        sma.setData(technicalIndicators.sma);
      } else {
        sma.setData([]);
      }

      if (activeIndicators.ema && technicalIndicators.ema.length > 0) {
        ema.setData(technicalIndicators.ema);
      } else {
        ema.setData([]);
      }

      if (activeIndicators.rsi && technicalIndicators.rsi.length > 0) {
        rsi.setData(technicalIndicators.rsi);
      } else {
        rsi.setData([]);
      }

      if (activeIndicators.macd) {
        const macdData = technicalIndicators.macd.map(d => ({ time: d.time, value: d.macd }));
        const signalData = technicalIndicators.macd.map(d => ({ time: d.time, value: d.signal }));
        const histogramData = technicalIndicators.macd.map(d => ({ time: d.time, value: d.histogram }));
        
        chartRef.current.indicatorSeries.macd.macd.setData(macdData);
        chartRef.current.indicatorSeries.macd.signal.setData(signalData);
        chartRef.current.indicatorSeries.macd.histogram.setData(histogramData);
      } else {
        chartRef.current.indicatorSeries.macd.macd.setData([]);
        chartRef.current.indicatorSeries.macd.signal.setData([]);
        chartRef.current.indicatorSeries.macd.histogram.setData([]);
      }
    }
  }, [technicalIndicators, activeIndicators]);

  return (
    <div className="chart-container">
      <div ref={chartContainerRef} className="chart" />
    </div>
  );
}

export default Chart;