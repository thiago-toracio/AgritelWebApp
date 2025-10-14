import React from 'react';
import { MachineStatusColor } from '@/utils/machineStatus';

interface MachineIconProps {
  type: string; // e.g., "sugar-cane-harvester", "loader-sugar-cane", "truck"
  color: MachineStatusColor;
  heading?: number;
  size?: number;
}

const MachineIcon = ({ type, color, heading = 0, size = 48 }: MachineIconProps) => {
  const getIconPath = () => {
    try {
      // Dynamically construct the icon path: ${type}-${color}.svg
      return new URL(`/src/assets/icons/machines/${type}-${color}.svg`, import.meta.url).href;
    } catch (error) {
      console.error(`Icon not found: ${type}-${color}.svg`, error);
      // Fallback to grain-harvester if icon not found
      return new URL(`/src/assets/icons/machines/grain-harvester-${color}.svg`, import.meta.url).href;
    }
  };

  return (
    <div className="inline-block">
      <img
        src={getIconPath()}
        alt={`${type} ${color}`}
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
