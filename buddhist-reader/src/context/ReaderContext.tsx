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
  isScrolling: boolean;
  setIsScrolling: React.Dispatch<React.SetStateAction<boolean>>;
  scrollSpeed: number;
  setScrollSpeed: React.Dispatch<React.SetStateAction<number>>;
  textSize: number;
  setTextSize: React.Dispatch<React.SetStateAction<number>>;
  selectedLanguages: Language[];
  toggleLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  isUIVisible: boolean;
  setIsUIVisible: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [scrollSpeed, setScrollSpeed] = useState(2.0);
  const [textSize, setTextSize] = useState(1.25);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([
    "tibetan",
    "transliteration",
    "polish",
  ]);
  const [theme, setTheme] = useState<Theme>("light");
  const [isUIVisible, setIsUIVisible] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasScrollingBeforeManual = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const accumulatedScrollRef = useRef<number>(0);

  const toggleLanguage = useCallback((lang: Language) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(lang)) {
        if (prev.length <= 1) return prev;
        return prev.filter((l) => l !== lang);
      }
      return [...prev, lang];
    });
  }, []);

  // Auto-scroll: scroll every rAF frame, accumulate sub-pixels
  useEffect(() => {
    if (!isScrolling) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      accumulatedScrollRef.current = 0;
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    accumulatedScrollRef.current = 0;

    const scroll = () => {
      accumulatedScrollRef.current += scrollSpeed * 0.3;
      const pixels = Math.floor(accumulatedScrollRef.current);
      if (pixels >= 1) {
        container.scrollTop += pixels;
        accumulatedScrollRef.current -= pixels;
      }
      animationFrameRef.current = requestAnimationFrame(scroll);
    };

    animationFrameRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScrolling, scrollSpeed]);

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

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const value: ReaderContextType = {
    isScrolling,
    setIsScrolling,
    scrollSpeed,
    setScrollSpeed,
    textSize,
    setTextSize,
    selectedLanguages,
    toggleLanguage,
    theme,
    setTheme,
    isUIVisible,
    setIsUIVisible,
    scrollContainerRef,
  };

  return (
    <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>
  );
}
