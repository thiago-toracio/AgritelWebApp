import React from 'react';
import grainHarvesterGreen from '@/assets/icons/machines/grain-harvester-green.svg';
import grainHarvesterYellow from '@/assets/icons/machines/grain-harvester-yellow.svg';
import grainHarvesterBlue from '@/assets/icons/machines/grain-harvester-blue.svg';
import grainHarvesterRed from '@/assets/icons/machines/grain-harvester-red.svg';
import grainHarvesterGray from '@/assets/icons/machines/grain-harvester-gray.svg';

interface MachineIconProps {
  type: 'colhedora' | 'transbordo' | 'caminhao';
  color: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
  heading?: number;
  size?: number;
}

const MachineIcon = ({ type, color, heading = 0, size = 48 }: MachineIconProps) => {
  const getIconSrc = () => {
    // Por enquanto todos os tipos usam o grain-harvester
    // Futuramente podemos adicionar outros SVGs para transbordo e caminhão
    switch (color) {
      case 'green':
        return grainHarvesterGreen;
      case 'yellow':
        return grainHarvesterYellow;
      case 'blue':
        return grainHarvesterBlue;
      case 'red':
        return grainHarvesterRed;
      case 'gray':
        return grainHarvesterGray;
      default:
        return grainHarvesterGray;
    }
  };

  return (
    <div className="inline-block">
      <img
        src={getIconSrc()}
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
