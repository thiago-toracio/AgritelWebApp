import React from 'react';

interface MachineIconProps {
  type: 'colhedora' | 'transbordo' | 'caminhao';
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  direction?: number;
  size?: number;
}

const MachineIcon = ({ type, status, direction = 0, size = 48 }: MachineIconProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#22c55e'; // green
      case 'idle':
        return '#eab308'; // yellow
      case 'maintenance':
        return '#ef4444'; // red
      case 'offline':
        return '#3b82f6'; // blue
      default:
        return '#6b7280'; // gray
    }
  };

  const color = getStatusColor(status);

  const ColhedoraIcon = () => (
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

  const TransbordoIcon = () => (
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

  const CaminhaoIcon = () => (
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

  const renderIcon = () => {
    switch (type) {
      case 'colhedora':
        return <ColhedoraIcon />;
      case 'transbordo':
        return <TransbordoIcon />;
      case 'caminhao':
        return <CaminhaoIcon />;
      default:
        return <ColhedoraIcon />;
    }
  };

  return <div className="inline-block">{renderIcon()}</div>;
};

export default MachineIcon;