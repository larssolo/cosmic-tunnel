import React from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  timeRemaining: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeRemaining }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  // Change color based on time remaining
  const getColor = () => {
    if (timeRemaining <= 10) return "text-red-500";
    if (timeRemaining <= 30) return "text-yellow-500";
    return "text-green-400";
  };

  return (
    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="bg-black/70 backdrop-blur-sm px-8 py-4 rounded-2xl border-2 border-purple-500/50 shadow-lg">
        <div className="flex items-center gap-3">
          <Clock className={`${getColor()} animate-pulse`} size={32} />
          <div className={`text-5xl font-bold ${getColor()} font-mono tabular-nums`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};
