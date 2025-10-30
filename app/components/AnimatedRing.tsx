import React, { useState, useEffect, useMemo, useCallback } from 'react';

const AnimatedRing: React.FC = () => {
  const numBars = 60;
  const radius = 385;
  const barWidth = 10;
  const barHeight = 48;
  const progressBars = 25;
  const [startBar, setStartBar] = useState(0);

  const updateStartBar = useCallback(() => {
    setStartBar(prev => (prev + 1) % numBars);
  }, [numBars]);

  useEffect(() => {
    const interval = setInterval(updateStartBar, 50);
    return () => clearInterval(interval);
  }, [updateStartBar]);

  const bars = useMemo(() => {
    return Array.from({ length: numBars }, (_, i) => {
      const angle = (i / numBars) * 360;
      const posInComet = (i - startBar + numBars) % numBars;
      const isProgress = posInComet < progressBars;
      const opacity = isProgress ? 1 - (posInComet / progressBars) * 0.7 : 1;

      return (
        <rect
          key={i}
          x={-barWidth / 2}
          y={-radius}
          width={barWidth}
          height={barHeight}
          rx="3"
          ry="3"
          className={isProgress ? "text-cyan-400" : "text-slate-700 dark:text-slate-600"}
          transform={`rotate(${angle} 0 0)`}
          style={{ fill: 'currentColor', opacity }}
        />
      );
    });
  }, [startBar, numBars, progressBars, radius, barWidth, barHeight]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox="-400 -400 800 800"
        className="transform-gpu"
      >
        {bars}
      </svg>
    </div>
  );
};

export default AnimatedRing;