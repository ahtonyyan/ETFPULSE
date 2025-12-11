import React, { useMemo } from 'react';
import { ETFData } from '../types';
import Sparkline from './Sparkline';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ETFCardProps {
  data: ETFData;
}

const ETFCard: React.FC<ETFCardProps> = ({ data }) => {
  const isPositive = data.changePercent >= 0;
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
  const bgClass = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';
  const flashClass = data.price !== data.prevPrice 
    ? (data.price > data.prevPrice ? 'animate-flash-green' : 'animate-flash-red') 
    : '';

  // Format volume to K/M/B
  const formatVolume = (num: number) => {
    if (num >= 1.0e9) return (num / 1.0e9).toFixed(1) + 'B';
    if (num >= 1.0e6) return (num / 1.0e6).toFixed(1) + 'M';
    if (num >= 1.0e3) return (num / 1.0e3).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className={`relative p-3 border border-slate-800 bg-slate-900 flex flex-col justify-between h-24 sm:h-28 overflow-hidden group ${flashClass}`}>
      
      {/* Header: Symbol & Name */}
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-100 leading-tight">{data.symbol}</h3>
          <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{data.name}</p>
        </div>
        <div className={`text-right ${colorClass}`}>
          <div className="text-xs font-mono font-bold flex items-center justify-end gap-1">
             {isPositive ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
             {data.changePercent.toFixed(2)}%
          </div>
           <div className="text-[10px] text-slate-400">Vol: {formatVolume(data.volume)}</div>
        </div>
      </div>

      {/* Main Price */}
      <div className="z-10 mt-1">
        <span className="text-lg font-mono text-slate-200 tracking-tight">
          {data.price.toFixed(2)}
        </span>
        <span className="text-[10px] text-slate-500 ml-2 font-mono">
            {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}
        </span>
      </div>

      {/* Background Sparkline */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none">
        <Sparkline data={data.history} color={isPositive ? '#22c55e' : '#ef4444'} />
      </div>
      
      {/* Sector Badge */}
      <div className="absolute bottom-2 right-2 z-10">
         <span className={`text-[9px] px-1.5 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-400`}>
            {data.sector}
         </span>
      </div>
    </div>
  );
};

export default React.memo(ETFCard);