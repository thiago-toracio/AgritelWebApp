import React from 'react';

interface ColhedoraIconProps {
  color: string;
  direction?: number;
  size?: number;
}

const ColhedoraIcon: React.FC<ColhedoraIconProps> = ({ color, direction = 0, size = 48 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${direction}deg)` }}>
      {/* Main body */}
      <rect x="20" y="30" width="60" height="40" rx="4" fill={color} stroke="#000" strokeWidth="2"/>
      {/* Cutting head */}
      <rect x="10" y="40" width="15" height="20" rx="2" fill={color} stroke="#000" strokeWidth="2"/>
      {/* Engine compartment */}
      <rect x="75" y="35" width="15" height="30" rx="2" fill={color} stroke="#000" strokeWidth="2"/>
      {/* Tracks */}
      <ellipse cx="30" cy="75" rx="8" ry="4" fill="#333"/>
      <ellipse cx="70" cy="75" rx="8" ry="4" fill="#333"/>
      <ellipse cx="30" cy="25" rx="8" ry="4" fill="#333"/>
      <ellipse cx="70" cy="25" rx="8" ry="4" fill="#333"/>
      {/* Direction indicator */}
      <polygon points="50,15 55,25 45,25" fill="#000"/>
    </svg>
  );
};

export default ColhedoraIcon;
