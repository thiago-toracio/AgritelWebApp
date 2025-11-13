import React from "react";
import { cn } from "@/lib/utils";

interface MachineIconProps {
  icon: string;
  heading?: number;
  size?: number;
  className?: string;
}

const MachineIcon = ({
  icon,
  heading = 0,
  size = 48,
  className, 
}: MachineIconProps) => {
  const getIconPath = () => {
    try {
      return new URL(`/src/assets/icons/machines/${icon}`, import.meta.url).href;
    } catch (error) {
      console.error(`Icon not found: ${icon}`, error);

      return new URL(
        `/src/assets/icons/machines/truck-gray.svg`,
        import.meta.url
      ).href;
    }
  };

  return (
    <div className={cn("inline-block", className)}>
      <img
        src={getIconPath()}
        alt={`${icon}`}
        style={{
          width: size,
          height: size,
          transform: `rotate(${heading}deg)`,
          transition: "transform 0.3s ease",
        }}
      />
    </div>
  );
};

export default MachineIcon;