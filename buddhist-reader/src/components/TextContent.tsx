"use client";

import React from "react";
import { useReader } from "@/context/ReaderContext";
import { TextData } from "@/types";

interface TextContentProps {
  textData: TextData;
}

export function TextContent({ textData }: TextContentProps) {
  const { language, textSize } = useReader();

  const isTibetan = language === "tibetan";
  const fontClass = isTibetan ? "font-tibetan" : language === "sanskrit" ? "font-serif" : "font-body";
  const lineHeight = isTibetan ? "leading-loose" : "leading-relaxed";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      {/* Title */}
      <h1
        className={`font-headline text-center mb-8 ${isTibetan ? "font-tibetan" : ""}`}
        style={{ fontSize: `${textSize * 1.5}rem` }}
      >
        {textData.title[language]}
      </h1>

      {/* Sections */}
      {textData.sections.map((section) => (
        <div key={section.number} className="mb-10">
          <h2
            className={`font-headline text-center mb-4 opacity-80 ${
              isTibetan ? "font-tibetan" : ""
            }`}
            style={{ fontSize: `${textSize * 1.2}rem` }}
          >
            <span className="opacity-50 mr-2">{section.number}.</span>
            {section.title[language]}
          </h2>

          <div className={`${fontClass} ${lineHeight} space-y-4`}>
            {section.content[language].map((paragraph, pIdx) => (
              <p
                key={pIdx}
                className="text-content-paragraph"
                style={{ fontSize: `${textSize}rem` }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ))}

      {/* Glossary */}
      <div className="mt-16 pt-8 border-t">
        <h2
          className="font-headline text-center mb-6"
          style={{ fontSize: `${textSize * 1.2}rem` }}
        >
          {language === "tibetan"
            ? "ཚིག་མཛོད།"
            : language === "sanskrit"
            ? "Śabdakośaḥ"
            : language === "transliteration"
            ? "Tsik Dzö"
            : "Glossary"}
        </h2>

        <div className="grid gap-3">
          {textData.glossary.map((entry, idx) => (
            <div
              key={idx}
              className="glossary-entry p-3 rounded-lg"
            >
              <div className="font-semibold text-sm">
                {entry.english}
              </div>
              <div className="text-xs opacity-70 mt-1 space-x-3">
                <span className="font-tibetan">{entry.tibetan}</span>
                <span className="italic">{entry.sanskrit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
