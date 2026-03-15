"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useReader } from "@/context/ReaderContext";
import {
  Play,
  Pause,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Timer as TimerIcon,
  Move3d,
  Sun,
  Moon,
  BookOpen,
} from "lucide-react";
import { Theme } from "@/types";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ControlBar() {
  const {
    isScrolling,
    setIsScrolling,
    scrollSpeed,
    setScrollSpeed,
    isTiltEnabled,
    setIsTiltEnabled,
    textSize,
    setTextSize,
    theme,
    setTheme,
    isUIVisible,
    setIsUIVisible,
    elapsedTime,
    remainingTime,
    showRemaining,
    setShowRemaining,
  } = useReader();

  const decreaseSpeed = useCallback(() => {
    setScrollSpeed((prev) => Math.max(0.1, Math.round((prev - 0.1) * 10) / 10));
  }, [setScrollSpeed]);

  const increaseSpeed = useCallback(() => {
    setScrollSpeed((prev) => Math.min(5.0, Math.round((prev + 0.1) * 10) / 10));
  }, [setScrollSpeed]);

  const decreaseTextSize = useCallback(() => {
    setTextSize((prev) => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10));
  }, [setTextSize]);

  const increaseTextSize = useCallback(() => {
    setTextSize((prev) => Math.min(2.5, Math.round((prev + 0.1) * 10) / 10));
  }, [setTextSize]);

  const toggleTilt = useCallback(async () => {
    if (!isTiltEnabled) {
      // Request permission on iOS
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
          if (permission !== "granted") return;
        } catch {
          return;
        }
      }
      setIsTiltEnabled(true);
    } else {
      setIsTiltEnabled(false);
    }
  }, [isTiltEnabled, setIsTiltEnabled]);

  const cycleTheme = useCallback(() => {
    const themes: Theme[] = ["light", "dark", "sepia"];
    const currentIndex = themes.indexOf(theme);
    setTheme(themes[(currentIndex + 1) % themes.length]);
  }, [theme, setTheme]);

  const themeIcon = theme === "dark" ? <Moon className="h-4 w-4" /> : theme === "sepia" ? <BookOpen className="h-4 w-4" /> : <Sun className="h-4 w-4" />;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isUIVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Timer display above center */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setShowRemaining((prev) => !prev)}
          className="timer-display px-3 py-1 rounded-full text-sm font-mono backdrop-blur-md cursor-pointer"
        >
          <TimerIcon className="h-3 w-3 inline mr-1" />
          {showRemaining
            ? `-${formatTime(remainingTime)}`
            : formatTime(elapsedTime)}
        </button>
      </div>

      {/* Main control bar */}
      <div className="control-bar backdrop-blur-lg border-t px-2 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1">
          {/* Left: Speed controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={decreaseSpeed}
              disabled={scrollSpeed <= 0.1}
              aria-label="Decrease speed"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsScrolling((prev) => !prev)}
              className={isScrolling ? "active-button" : ""}
              aria-label={isScrolling ? "Pause" : "Play"}
            >
              {isScrolling ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={increaseSpeed}
              disabled={scrollSpeed >= 5.0}
              aria-label="Increase speed"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <span className="text-xs font-mono min-w-[2.5rem] text-center opacity-70">
              {scrollSpeed.toFixed(1)}x
            </span>
          </div>

          {/* Center: Fullscreen + Tilt + Theme */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsUIVisible(false)}
              aria-label="Toggle fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTilt}
              className={isTiltEnabled ? "active-button" : ""}
              aria-label="Toggle tilt scroll"
            >
              <Move3d className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              aria-label="Change theme"
            >
              {themeIcon}
            </Button>
          </div>

          {/* Right: Text size controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={decreaseTextSize}
              disabled={textSize <= 0.5}
              aria-label="Decrease text size"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <span className="text-xs font-mono min-w-[2.5rem] text-center opacity-70">
              {Math.round((textSize / 1.25) * 100)}%
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={increaseTextSize}
              disabled={textSize >= 2.5}
              aria-label="Increase text size"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
