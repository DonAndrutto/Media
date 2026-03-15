"use client";
import { useState, useEffect, useCallback } from 'react';

interface UseTiltScrollOptions {
  scrollSpeed: number;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onReadingStart?: () => void;
}

interface UseTiltScrollReturn {
  isTiltScrolling: boolean;
  permissionGranted: boolean;
  requestTiltPermission: () => Promise<void>;
  toggleTiltScroll: () => void;
}

export function useTiltScroll({ scrollSpeed, scrollContainerRef, onReadingStart }: UseTiltScrollOptions): UseTiltScrollReturn {
  const [isTiltScrolling, setIsTiltScrolling] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Tilt engine
  useEffect(() => {
    let animationFrameId: number | null = null;
    let referenceBeta: number | null = null;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null) return;

      if (referenceBeta === null) {
        referenceBeta = event.beta;
      }

      const tilt = event.beta - referenceBeta;
      const scrollAmount = Math.pow(Math.abs(tilt) / 10, 2) * Math.sign(tilt) * scrollSpeed;

      const scroll = () => {
        if (isTiltScrolling && Math.abs(tilt) > 1) {
          if (scrollContainerRef?.current) {
            scrollContainerRef.current.scrollBy({ top: scrollAmount, behavior: 'auto' });
          } else {
            window.scrollBy({ top: scrollAmount, behavior: 'auto' });
          }
          animationFrameId = requestAnimationFrame(scroll);
        } else {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
        }
      };

      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      scroll();
    };

    const start = () => {
      if (isTiltScrolling && permissionGranted) {
        onReadingStart?.();
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    const stop = () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      referenceBeta = null;
    };

    if (isTiltScrolling && permissionGranted) {
      start();
    } else {
      stop();
    }

    return stop;
  }, [isTiltScrolling, permissionGranted, scrollSpeed, scrollContainerRef, onReadingStart]);

  const requestTiltPermission = useCallback(async () => {
    const devOri = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof devOri.requestPermission === 'function') {
      try {
        const permission = await devOri.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          setIsTiltScrolling(true);
        } else {
          alert('Permission to access device orientation was denied.');
          setIsTiltScrolling(false);
          setPermissionGranted(false);
        }
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
        setIsTiltScrolling(false);
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
      setIsTiltScrolling(true);
    }
  }, []);

  const toggleTiltScroll = useCallback(() => {
    if (isTiltScrolling) {
      setIsTiltScrolling(false);
      setPermissionGranted(false);
    } else {
      requestTiltPermission();
    }
  }, [isTiltScrolling, requestTiltPermission]);

  return {
    isTiltScrolling,
    permissionGranted,
    requestTiltPermission,
    toggleTiltScroll,
  };
}
