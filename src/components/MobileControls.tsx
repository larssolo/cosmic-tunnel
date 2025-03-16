
import React, { useEffect, useCallback } from "react";

interface MobileControlsProps {
  isMobile: boolean;
  gameOver: boolean;
  onMove: (position: number) => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  isMobile,
  gameOver,
  onMove
}) => {
  // Handle device orientation for mobile controls
  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (event.gamma === null) return;
    
    // Calculate position based on device tilt (gamma value)
    const tiltSensitivity = 2; // Adjust sensitivity
    const normalizedGamma = event.gamma * tiltSensitivity;
    const position = 50 + normalizedGamma; // Center (50) + tilt adjustment
    onMove(position);
  }, [onMove]);

  // Set up device orientation handler for mobile devices
  useEffect(() => {
    if (!isMobile || gameOver) return;
    
    // Request device orientation permissions on iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        })
        .catch(console.error);
    } else {
      // For non-iOS or older iOS
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [isMobile, gameOver, handleDeviceOrientation]);

  // This component doesn't render anything visible
  return null;
};

export default MobileControls;
