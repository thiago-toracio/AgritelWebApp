import React from 'react';

interface TransbordoIconProps {
  color: string;
  direction?: number;
  size?: number;
}

const TransbordoIcon: React.FC<TransbordoIconProps> = ({ color, direction = 0, size = 48 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${direction}deg)` }}>
      {/* Tractor body */}
      <rect x="35" y="25" width="30" height="35" rx="3" fill={color} stroke="#000" strokeWidth="2"/>
      {/* Cabin */}
      <rect x="40" y="30" width="20" height="20" rx="2" fill={color} stroke="#000" strokeWidth="2"/>
      {/* Transshipment box */}
      <rect x="15" y="40" width="25" height="25" rx="2" fill={color} stroke="#000" strokeWidth="1.5"/>
      {/* Front wheels */}      
      <circle cx="50" cy="75" r="6" fill="#333"/>
      <circle cx="50" cy="25" r="6" fill="#333"/>
      {/* Rear wheels (larger) */}
      <circle cx="25" cy="75" r="8" fill="#333"/>
      <circle cx="25" cy="25" r="8" fill="#333"/>
      {/* Direction indicator */}
      <polygon points="50,12 55,22 45,22" fill="#000"/>
    </svg>
  );
};

export default TransbordoIcon;
