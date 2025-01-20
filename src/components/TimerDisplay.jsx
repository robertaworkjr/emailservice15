import React from 'react';
import PropTypes from 'prop-types';
import { Timer } from 'lucide-react';

export default function TimerDisplay({ minutes, seconds }) {
  // Input validation
  const validMinutes = Math.max(0, Math.min(59, parseInt(minutes) || 0));
  const validSeconds = Math.max(0, Math.min(59, parseInt(seconds) || 0));

  return (
    <div className="timer-display flex flex-col items-center justify-center space-y-2">
      <Timer className="w-12 h-12 text-white/80 mb-2" />
      <div className="font-mono bg-white/20 backdrop-blur-sm rounded-lg px-8 py-4">
        <span className="text-6xl md:text-7xl font-bold tracking-wider">
          {String(validMinutes).padStart(2, '0')}:{String(validSeconds).padStart(2, '0')}
        </span>
      </div>
      <div className="text-white/60 text-sm mt-2">
        {validMinutes === 0 && validSeconds === 0 
          ? "Time's up!" 
          : "Time remaining"}
      </div>
    </div>
  );
}

TimerDisplay.propTypes = {
  minutes: PropTypes.number.isRequired,
  seconds: PropTypes.number.isRequired
};

TimerDisplay.defaultProps = {
  minutes: 0,
  seconds: 0
};
