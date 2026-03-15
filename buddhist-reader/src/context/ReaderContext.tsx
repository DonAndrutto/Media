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
  tiltPermissionGranted: boolean;
  requestTiltPermission: () => Promise<void>;
  // Text size
  textSize: number;
  setTextSize: React.Dispatch<React.SetStateAction<number>>;
  // Languages (multi-select)
  selectedLanguages: Language[];
  toggleLanguage: (lang: Language) => void;
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
  const [tiltPermissionGranted, setTiltPermissionGranted] = useState(false);
  const [textSize, setTextSize] = useState(1.25);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([
    "tibetan",
    "transliteration",
    "polish",
  ]);
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
  const accumulatedScrollRef = useRef<number>(0);

  const requestTiltPermission = useCallback(async () => {
    if (
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === "function"
    ) {
      try {
        const permission = await (
          DeviceOrientationEvent as unknown as {
            requestPermission: () => Promise<string>;
          }
        ).requestPermission();
        if (permission === "granted") {
          setTiltPermissionGranted(true);
        }
      } catch {
        // Permission denied or error
      }
    } else {
      // Non-iOS browsers don't need permission
      setTiltPermissionGranted(true);
    }
  }, []);

  const toggleLanguage = useCallback((lang: Language) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(lang)) {
        // Don't allow deselecting all
        if (prev.length <= 1) return prev;
        return prev.filter((l) => l !== lang);
      }
      return [...prev, lang];
    });
  }, []);

  // Auto-scroll with requestAnimationFrame + sub-pixel accumulation
  useEffect(() => {
    if (!isScrolling || isTiltEnabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      accumulatedScrollRef.current = 0;
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    lastFrameTimeRef.current = performance.now();
    accumulatedScrollRef.current = 0;

    const scroll = (now: number) => {
      const delta = now - lastFrameTimeRef.current;
      // Target 16ms intervals (60fps)
      if (delta >= 16) {
        accumulatedScrollRef.current += scrollSpeed * 0.3;
        const pixels = Math.floor(accumulatedScrollRef.current);
        if (pixels >= 1) {
          container.scrollBy({ top: pixels, behavior: "auto" });
          accumulatedScrollRef.current -= pixels;
        }
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

  // Tilt-to-scroll using proven working code pattern
  useEffect(() => {
    let animationFrameId: number | null = null;
    let referenceBeta: number | null = null;

    const container = scrollContainerRef.current;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || !container) return;

      if (referenceBeta === null) {
        referenceBeta = event.beta; // baseline reference angle
      }

      const tilt = event.beta - referenceBeta; // delta from baseline
      const scrollAmount =
        Math.pow(Math.abs(tilt) / 10, 2) * -Math.sign(tilt) * scrollSpeed;

      // actual scrolling on requestAnimationFrame
      const scroll = () => {
        if (isTiltEnabled && tiltPermissionGranted && Math.abs(tilt) > 1) {
          container.scrollBy({ top: scrollAmount, behavior: "auto" });
          animationFrameId = requestAnimationFrame(scroll);
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      };

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      scroll();
    };

    if (isTiltEnabled && tiltPermissionGranted) {
      window.addEventListener("deviceorientation", handleOrientation);
    } else {
      window.removeEventListener("deviceorientation", handleOrientation);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      referenceBeta = null;
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isTiltEnabled, tiltPermissionGranted, scrollSpeed]);

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
    tiltPermissionGranted,
    requestTiltPermission,
    textSize,
    setTextSize,
    selectedLanguages,
    toggleLanguage,
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
