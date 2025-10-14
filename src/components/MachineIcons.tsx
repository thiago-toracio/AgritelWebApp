import React from 'react';
import { ColhedoraIcon, TransbordoIcon, CaminhaoIcon } from '@/assets/icons/machines';

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

  const renderIcon = () => {
    switch (type) {
      case 'colhedora':
        return <ColhedoraIcon color={color} direction={direction} size={size} />;
      case 'transbordo':
        return <TransbordoIcon color={color} direction={direction} size={size} />;
      case 'caminhao':
        return <CaminhaoIcon color={color} direction={direction} size={size} />;
      default:
        return <ColhedoraIcon color={color} direction={direction} size={size} />;
    }
  };

  return <div className="inline-block">{renderIcon()}</div>;
};

export default MachineIcon;
