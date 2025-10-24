import React from 'react';

interface MachineIconProps {
  icon: string
  heading?: number;
  size?: number;
}

const MachineIcon = ({ icon, heading = 0, size = 48 }: MachineIconProps) => {
  const getIconPath = () => {
    try {
      return new URL(`/src/assets/icons/machines/${icon}`, import.meta.url).href;
    } catch (error) {
      console.error(`Icon not found: ${icon}`, error);
      
      return new URL(`/src/assets/icons/machines/truck-gray.svg`, import.meta.url).href;
    }
  };

  return (
    <div className="inline-block">
      <img
        src={getIconPath()}
        alt={`${icon}`}
        style={{
          width: size,
          height: size,
          transform: `rotate(${heading}deg)`,
          transition: 'transform 0.3s ease'
        }}
      />
    </div>
  );
};

export default MachineIcon;
