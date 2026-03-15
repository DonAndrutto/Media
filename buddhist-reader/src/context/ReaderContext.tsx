"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Language, Theme } from "@/types";

interface ReaderContextType {
  // Scroll state
  isScrolling: boolean;
  setIsScrolling: React.Dispatch<React.SetStateAction<boolean>>;
  scrollSpeed: number;
  setScrollSpeed: React.Dispatch<React.SetStateAction<number>>;
  // Tilt state
  isTiltEnabled: boolean;
  setIsTiltEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  // Text size
  textSize: number;
  setTextSize: React.Dispatch<React.SetStateAction<number>>;
  // Language
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  // Theme
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  // UI visibility
  isUIVisible: boolean;
  setIsUIVisible: React.Dispatch<React.SetStateAction<boolean>>;
  // Timer
  elapsedTime: number;
  remainingTime: number;
  showRemaining: boolean;
  setShowRemaining: React.Dispatch<React.SetStateAction<boolean>>;
  // Refs
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

const ReaderContext = createContext<ReaderContextType | null>(null);

export function useReader() {
  const context = useContext(ReaderContext);
  if (!context) throw new Error("useReader must be used within ReaderProvider");
  return context;
}

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1.1);
  const [isTiltEnabled, setIsTiltEnabled] = useState(false);
  const [textSize, setTextSize] = useState(1.25);
  const [language, setLanguage] = useState<Language>("polish");
  const [theme, setTheme] = useState<Theme>("light");
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showRemaining, setShowRemaining] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasScrollingBeforeManual = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Auto-scroll with requestAnimationFrame
  useEffect(() => {
    if (!isScrolling || isTiltEnabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    lastFrameTimeRef.current = performance.now();

    const scroll = (now: number) => {
      const delta = now - lastFrameTimeRef.current;
      // Target 16ms intervals (60fps)
      if (delta >= 16) {
        const scrollAmount = scrollSpeed * 0.3;
        container.scrollBy({ top: scrollAmount, behavior: "auto" });
        lastFrameTimeRef.current = now;
      }
      animationFrameRef.current = requestAnimationFrame(scroll);
    };

    animationFrameRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScrolling, scrollSpeed, isTiltEnabled]);

  // Tilt-to-scroll
  useEffect(() => {
    if (!isTiltEnabled) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let lastTime = performance.now();
    let rafId: number | null = null;
    let currentTilt = 0;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta ?? 0;
      // Normalize: 0 at ~45 degrees (natural phone holding angle)
      currentTilt = beta - 45;
    };

    const tiltScroll = (now: number) => {
      const delta = now - lastTime;
      if (delta >= 16) {
        const absTilt = Math.abs(currentTilt);
        if (absTilt > 1) {
          // Dead zone > 1 degree
          const direction = currentTilt > 0 ? 1 : -1;
          const speed = Math.pow(absTilt / 10, 2);
          container.scrollBy({ top: direction * speed, behavior: "auto" });
        }
        lastTime = now;
      }
      rafId = requestAnimationFrame(tiltScroll);
    };

    window.addEventListener("deviceorientation", handleOrientation, {
      passive: true,
    });
    rafId = requestAnimationFrame(tiltScroll);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isTiltEnabled]);

  // Manual scroll detection - pauses auto-scroll for 2 seconds
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isUserScrolling = false;

    const handleWheel = () => {
      if (!isScrolling) return;
      isUserScrolling = true;
      wasScrollingBeforeManual.current = true;
      setIsScrolling(false);

      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      manualScrollTimeoutRef.current = setTimeout(() => {
        if (wasScrollingBeforeManual.current) {
          setIsScrolling(true);
          wasScrollingBeforeManual.current = false;
        }
        isUserScrolling = false;
      }, 2000);
    };

    const handleTouchStart = () => {
      if (!isScrolling) return;
      isUserScrolling = true;
      wasScrollingBeforeManual.current = true;
      setIsScrolling(false);
    };

    const handleTouchEnd = () => {
      if (!isUserScrolling) return;
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      manualScrollTimeoutRef.current = setTimeout(() => {
        if (wasScrollingBeforeManual.current) {
          setIsScrolling(true);
          wasScrollingBeforeManual.current = false;
        }
        isUserScrolling = false;
      }, 2000);
    };

    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, [isScrolling]);

  // Timer calculation
  useEffect(() => {
    if (isScrolling) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isScrolling]);

  // Calculate remaining time based on scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateRemaining = () => {
      const pixelsPerSecond = 18 * scrollSpeed;
      const remainingPixels =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setRemainingTime(
        Math.max(0, Math.ceil(remainingPixels / pixelsPerSecond))
      );
    };

    updateRemaining();
    container.addEventListener("scroll", updateRemaining, { passive: true });
    return () => container.removeEventListener("scroll", updateRemaining);
  }, [scrollSpeed]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const value: ReaderContextType = {
    isScrolling,
    setIsScrolling,
    scrollSpeed,
    setScrollSpeed,
    isTiltEnabled,
    setIsTiltEnabled,
    textSize,
    setTextSize,
    language,
    setLanguage,
    theme,
    setTheme,
    isUIVisible,
    setIsUIVisible,
    elapsedTime,
    remainingTime,
    showRemaining,
    setShowRemaining,
    scrollContainerRef,
  };

  return (
    <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>
  );
}
