// app/components/TvChart.tsx
'use client';
import { useEffect, useRef } from 'react';

export default function TvChart({
  symbol = 'BINANCE:BTCUSDT',
  theme = 'dark',
  height = 500,
}: { symbol?: string; theme?: 'light'|'dark'; height?: number }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    // clean up if re-rendered
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore global from tv.js
      new TradingView.widget({
        container_id: container.current!.id,
        autosize: true,
        symbol,                 // e.g. BINANCE:ETHUSDT
        interval: '60',
        theme,
        timezone: 'Etc/UTC',
        style: '1',
        hide_top_toolbar: false,
        hide_legend: false,
        withdateranges: true,
        allow_symbol_change: true,
        studies: [],
        locale: 'en',
      });
    };
    container.current.appendChild(script);
  }, [symbol, theme]);

  return <div id="tvchart" ref={container} style={{ height }} />;
}
