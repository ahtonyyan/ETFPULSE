import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ETFData, MarketSummary, MarketTrend } from './types';
import ETFCard from './components/ETFCard';
import { analyzeMarket } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Zap, Search, BrainCircuit, RefreshCw } from 'lucide-react';

// --- INITIAL MOCK DATA CONFIG ---
const INITIAL_ETFS = [
  { s: 'SPY', n: 'SPDR S&P 500', sec: 'Equity', p: 512.30 },
  { s: 'QQQ', n: 'Invesco QQQ', sec: 'Tech', p: 440.50 },
  { s: 'IWM', n: 'Russell 2000', sec: 'Small Cap', p: 205.10 },
  { s: 'EEM', n: 'Emerging Mkts', sec: 'Global', p: 41.20 },
  { s: 'XLF', n: 'Financial Select', sec: 'Finance', p: 42.15 },
  { s: 'XLK', n: 'Technology Select', sec: 'Tech', p: 210.80 },
  { s: 'XLE', n: 'Energy Select', sec: 'Energy', p: 92.40 },
  { s: 'XLV', n: 'Health Care', sec: 'Health', p: 145.20 },
  { s: 'GLD', n: 'SPDR Gold', sec: 'Commodity', p: 215.00 },
  { s: 'SLV', n: 'iShares Silver', sec: 'Commodity', p: 24.50 },
  { s: 'TLT', n: '20+ Year Treasury', sec: 'Bond', p: 94.30 },
  { s: 'VXX', n: 'Volatility Index', sec: 'Volatility', p: 14.20 },
  { s: 'ARKK', n: 'ARK Innovation', sec: 'Growth', p: 48.90 },
  { s: 'SMH', n: 'Semiconductor', sec: 'Tech', p: 225.60 },
  { s: 'XBI', n: 'Biotech', sec: 'Health', p: 92.10 },
  { s: 'KWEB', n: 'China Internet', sec: 'Global', p: 26.40 },
  { s: 'EWJ', n: 'MSCI Japan', sec: 'Global', p: 68.90 },
  { s: 'VGK', n: 'FTSE Europe', sec: 'Global', p: 65.20 },
  { s: 'USO', n: 'United States Oil', sec: 'Energy', p: 78.50 },
  { s: 'JETS', n: 'Global Jets', sec: 'Transport', p: 20.10 },
  { s: 'XRT', n: 'Retail', sec: 'Cons. Disc', p: 76.40 },
  { s: 'XHB', n: 'Homebuilders', sec: 'Cons. Disc', p: 105.20 },
  { s: 'GDX', n: 'Gold Miners', sec: 'Commodity', p: 32.10 },
  { s: 'HYG', n: 'High Yield Bond', sec: 'Bond', p: 77.80 },
];

const generateInitialData = (): ETFData[] => {
  return INITIAL_ETFS.map(etf => {
    const changePercent = (Math.random() * 4) - 2; // -2% to +2%
    const change = etf.p * (changePercent / 100);
    return {
      symbol: etf.s,
      name: etf.n,
      sector: etf.sec,
      price: etf.p,
      prevPrice: etf.p,
      change: change,
      changePercent: changePercent,
      volume: Math.floor(Math.random() * 50000000) + 1000000,
      history: Array.from({ length: 20 }, () => etf.p + (Math.random() * 2 - 1))
    };
  });
};

const App: React.FC = () => {
  const [data, setData] = useState<ETFData[]>(generateInitialData);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate Market Ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        return prevData.map(etf => {
          const volatility = 0.002; // 0.2% movement per tick
          const move = (Math.random() * volatility * 2) - volatility;
          const newPrice = Math.max(0.01, etf.price * (1 + move));
          const priceDiff = newPrice - etf.price;
          
          // Add to volume occasionally
          const volumeTick = Math.random() > 0.5 ? Math.floor(Math.random() * 5000) : 0;

          // Update history
          const newHistory = [...etf.history.slice(1), newPrice];

          // Calculate new daily change stats based on original "open" roughly
          // For simplicty in this simulation, we update change based on the move
          const newChange = etf.change + (newPrice - etf.price); 
          const originalOpen = etf.price - etf.change; // Approximate open
          const newChangePercent = ((newPrice - originalOpen) / originalOpen) * 100;

          return {
            ...etf,
            prevPrice: etf.price,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            volume: etf.volume + volumeTick,
            history: newHistory
          };
        });
      });
      setLastUpdated(new Date());
    }, 2000); // Tick every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // AI Analysis Handler
  const handleAnalyze = useCallback(async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const summary = await analyzeMarket(data);
      setMarketSummary(summary);
    } finally {
      setIsAnalyzing(false);
    }
  }, [data, isAnalyzing]);

  // Derived Data for Rankings
  const topGainers = useMemo(() => 
    [...data].sort((a, b) => b.changePercent - a.changePercent).slice(0, 8), 
  [data]);

  const topLosers = useMemo(() => 
    [...data].sort((a, b) => a.changePercent - b.changePercent).slice(0, 8), 
  [data]);

  const topVolume = useMemo(() => 
    [...data].sort((a, b) => b.volume - a.volume).slice(0, 10), 
  [data]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col h-screen">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-500" />
          <h1 className="text-lg font-bold tracking-wide text-slate-100">ETF<span className="text-blue-500">PULSE</span></h1>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-slate-400">
           <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>MARKET OPEN</span>
           </div>
           <div>Last Tick: {lastUpdated.toLocaleTimeString()}</div>
           
           <button 
             onClick={handleAnalyze}
             disabled={isAnalyzing}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
           >
             {isAnalyzing ? <RefreshCw className="animate-spin" size={14}/> : <BrainCircuit size={14}/>}
             GEMINI INSIGHT
           </button>
        </div>
      </header>

      {/* Main Content - CSS Grid Layout */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: Data Grid (Takes up 3/4 width on large screens) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* AI Insight Section */}
          {marketSummary && (
            <div className="bg-slate-900 border border-blue-900/50 rounded-lg p-4 shadow-lg shadow-blue-900/10 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 mt-1">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-100">AI Market Analysis</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      marketSummary.trend === MarketTrend.BULLISH ? 'border-green-800 bg-green-900/30 text-green-400' :
                      marketSummary.trend === MarketTrend.BEARISH ? 'border-red-800 bg-red-900/30 text-red-400' :
                      'border-yellow-800 bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {marketSummary.trend}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-2">
                    {marketSummary.summary}
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-slate-500">Focus:</span>
                    {marketSummary.keyMovers.map(t => (
                      <span key={t} className="text-blue-400 font-mono">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
               <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Global ETF Watchlist</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {data.map((etf) => (
                <ETFCard key={etf.symbol} data={etf} />
              ))}
            </div>
          </div>

          {/* Split Charts: Gainers vs Losers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-80">
             {/* Gainers */}
             <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col">
                <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase">
                  <TrendingUp size={16}/> Top Performers
                </h3>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topGainers} margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="symbol" type="category" width={40} tick={{fill: '#94a3b8', fontSize: 10}} interval={0}/>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                        cursor={{fill: '#1e293b'}}
                      />
                      <Bar dataKey="changePercent" fill="#22c55e" radius={[0, 4, 4, 0]}>
                        {topGainers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#22c55e" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Losers */}
             <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col">
                <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase">
                  <TrendingDown size={16}/> Top Laggards
                </h3>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topLosers} margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="symbol" type="category" width={40} tick={{fill: '#94a3b8', fontSize: 10}} interval={0}/>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                        cursor={{fill: '#1e293b'}}
                      />
                      <Bar dataKey="changePercent" fill="#ef4444" radius={[0, 4, 4, 0]}>
                         {topLosers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#ef4444" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Volume Leaderboard */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
            <h3 className="text-slate-100 font-bold flex items-center gap-2 text-sm uppercase">
              <Zap size={16} className="text-yellow-500" />
              Volume Leaders
            </h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-900">
                <tr>
                  <th className="pb-2 pl-2">Ticker</th>
                  <th className="pb-2 text-right">Last</th>
                  <th className="pb-2 text-right pr-2">Vol</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topVolume.map((etf, idx) => (
                  <tr key={etf.symbol} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 pl-2 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                         <span className="text-slate-500 w-3 text-[10px]">{idx + 1}</span>
                         {etf.symbol}
                      </div>
                    </td>
                    <td className={`py-2.5 text-right font-mono ${etf.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {etf.price.toFixed(2)}
                    </td>
                    <td className="py-2.5 pr-2 text-right font-mono text-slate-400 text-xs">
                      {(etf.volume / 1000000).toFixed(1)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;