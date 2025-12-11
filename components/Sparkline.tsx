import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface SparklineProps {
  data: number[];
  color: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color }) => {
  const chartData = data.map((val, idx) => ({ i: idx, v: val }));

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false} // Disable animation for performance in real-time grid
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(Sparkline);