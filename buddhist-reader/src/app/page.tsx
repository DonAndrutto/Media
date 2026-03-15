"use client";

import React from "react";
import { ReaderProvider, useReader } from "@/context/ReaderContext";
import { ControlBar } from "@/components/ControlBar";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TextContent } from "@/components/TextContent";
import { practiceText } from "@/data/sample-text";
import { useTiltScroll } from "@/app/hooks/useTiltScroll";
import { Minimize } from "lucide-react";

function ReaderApp() {
  const { isUIVisible, setIsUIVisible, scrollContainerRef, scrollSpeed } =
    useReader();

  const { isTiltScrolling, toggleTiltScroll } = useTiltScroll({
    scrollSpeed,
    scrollContainerRef,
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Language selector (top) */}
      <div
        className={`transition-transform duration-300 ${
          isUIVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <LanguageSelector />
      </div>

      {/* Scrollable text content */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto reader-scroll"
      >
        <TextContent textData={practiceText} />
      </div>

      {/* Control bar (bottom) */}
      <ControlBar
        isTiltScrolling={isTiltScrolling}
        toggleTiltScroll={toggleTiltScroll}
      />

      {/* Restore button when UI is hidden */}
      {!isUIVisible && (
        <button
          onClick={() => setIsUIVisible(true)}
          className="restore-button"
          aria-label="Show controls"
        >
          <Minimize
            className="h-5 w-5"
            style={{ color: "var(--foreground)" }}
          />
        </button>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ReaderProvider>
      <ReaderApp />
    </ReaderProvider>
  );
}
