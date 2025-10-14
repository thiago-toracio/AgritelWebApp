import React from 'react';

interface CaminhaoIconProps {
  color: string;
  direction?: number;
  size?: number;
}

const CaminhaoIcon: React.FC<CaminhaoIconProps> = ({ color, direction = 0, size = 48 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${direction}deg)` }}>
      {/* Truck cabin */}
      <rect x="70" y="35" width="20" height="30" rx="3" fill={color} stroke="#000" strokeWidth="2"/>
      {/* Cargo area */}
      <rect x="20" y="30" width="55" height="40" rx="2" fill={color} stroke="#000" strokeWidth="2"/>
      {/* Front wheels */}
      <circle cx="80" cy="75" r="6" fill="#333"/>
      <circle cx="80" cy="25" r="6" fill="#333"/>
      {/* Middle wheels */}
      <circle cx="55" cy="75" r="6" fill="#333"/>
      <circle cx="55" cy="25" r="6" fill="#333"/>
      {/* Rear wheels */}
      <circle cx="30" cy="75" r="6" fill="#333"/>
      <circle cx="30" cy="25" r="6" fill="#333"/>
      {/* Direction indicator */}
      <polygon points="85,15 90,25 80,25" fill="#000"/>
    </svg>
  );
};

export default CaminhaoIcon;
