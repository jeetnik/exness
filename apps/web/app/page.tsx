"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  createChart,
  IChartApi,
  CandlestickData,
  CandlestickSeries,
} from "lightweight-charts";

export default function Home() {
  const [channels, setChannels] = useState<string[]>([]);
  const [asset, setAsset] = useState<string>("");

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const currentCandleRef = useRef<CandlestickData | null>(null);

  
  async function getAllChannels() {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/v1/candels/channels"
      );
      setChannels(res.data.channels);
    } catch (e) {
      console.error("Failed to fetch channels", e);
    }
  }
getAllChannels();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#e5e7eb",
      },
      grid: {
        vertLines: { color: "#1f2933" },
        horzLines: { color: "#1f2933" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      borderVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [asset]);

  useEffect(() => {
    if (!asset || !candleSeriesRef.current) return;

    wsRef.current?.close();

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ op: "subscribe", channels: [asset] }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.p || !data.T) return;

      const time = Math.floor(new Date(data.T).getTime() / 1000);
      const price = Number(data.p);

      if (
        !currentCandleRef.current ||
        currentCandleRef.current.time !== time
      ) {
        currentCandleRef.current = {
          time,
          open: price,
          high: price,
          low: price,
          close: price,
        };
      } else {
        currentCandleRef.current.high = Math.max(
          currentCandleRef.current.high,
          price
        );
        currentCandleRef.current.low = Math.min(
          currentCandleRef.current.low,
          price
        );
        currentCandleRef.current.close = price;
      }

      candleSeriesRef.current.update(currentCandleRef.current);
    };

    return () => {
      ws.close();
      currentCandleRef.current = null;
    };
  }, [asset]);

  return (
    <div style={{ padding: 16 }}>
    

      <div style={{ marginTop: 12 }}>
        {channels.map((c) => (
          <button
            key={c}
            style={{ marginRight: 8 }}
            onClick={() => setAsset(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>Asset: {asset}</div>

      <div
        ref={chartContainerRef}
        style={{ marginTop: 16, width: "100%", height: 400 }}
      />
    </div>
  );
}
