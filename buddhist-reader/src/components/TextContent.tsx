"use client";

import React from "react";
import { useReader } from "@/context/ReaderContext";
import { TextData, ContentItem, Language } from "@/types";

interface TextContentProps {
  textData: TextData;
}

function VerseBlock({
  item,
  language,
  textSize,
}: {
  item: ContentItem & { type: "verse" | "verse-no-polish" };
  language: Language;
  textSize: number;
}) {
  if (language === "tibetan") {
    return (
      <p
        className="font-tibetan leading-loose text-center"
        style={{ fontSize: `${textSize}rem` }}
      >
        {item.tibetan}
      </p>
    );
  }
  if (language === "transliteration") {
    return (
      <p
        className="font-body tracking-wide text-center"
        style={{ fontSize: `${textSize}rem` }}
      >
        {item.transliteration}
      </p>
    );
  }
  // Polish
  if (item.type === "verse-no-polish") {
    return (
      <p
        className="font-body tracking-wide text-center italic opacity-70"
        style={{ fontSize: `${textSize * 0.9}rem` }}
      >
        {item.transliteration}
      </p>
    );
  }
  return (
    <p
      className="font-body text-center"
      style={{ fontSize: `${textSize}rem` }}
    >
      {item.polish}
    </p>
  );
}

function MantraBlock({
  item,
  language,
  textSize,
}: {
  item: ContentItem & { type: "mantra" };
  language: Language;
  textSize: number;
}) {
  return (
    <div className="mantra-block my-6 py-4 text-center">
      {language === "tibetan" ? (
        <p
          className="font-tibetan leading-loose font-bold"
          style={{ fontSize: `${textSize * 1.3}rem` }}
        >
          {item.tibetan}
        </p>
      ) : language === "transliteration" ? (
        <p
          className="font-bold tracking-widest"
          style={{ fontSize: `${textSize * 1.2}rem` }}
        >
          {item.transliteration}
        </p>
      ) : (
        <p
          className="font-bold tracking-widest"
          style={{ fontSize: `${textSize * 1.2}rem` }}
        >
          {item.transliteration}
        </p>
      )}
    </div>
  );
}

function ContentItemView({
  item,
  language,
  textSize,
}: {
  item: ContentItem;
  language: Language;
  textSize: number;
}) {
  switch (item.type) {
    case "verse":
    case "verse-no-polish":
      return <VerseBlock item={item} language={language} textSize={textSize} />;
    case "mantra":
      return <MantraBlock item={item} language={language} textSize={textSize} />;
    case "instruction":
      return (
        <div
          className="instruction-block my-4 px-4 py-3 rounded-lg italic opacity-85"
          style={{ fontSize: `${textSize * 0.85}rem` }}
        >
          {item.text}
        </div>
      );
    case "footnote":
      return (
        <p
          className="text-center italic opacity-60 my-2"
          style={{ fontSize: `${textSize * 0.75}rem` }}
        >
          {item.text}
        </p>
      );
  }
}

export function TextContent({ textData }: TextContentProps) {
  const { language, textSize } = useReader();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      {/* Title block */}
      <div className="text-center mb-10">
        <h1
          className="font-tibetan leading-loose mb-2"
          style={{ fontSize: `${textSize * 1.6}rem` }}
        >
          {textData.tibetanTitle}
        </h1>
        <h2
          className="tracking-widest mb-3 opacity-80"
          style={{ fontSize: `${textSize * 0.9}rem` }}
        >
          {textData.transliterationTitle}
        </h2>
        <h2
          className="font-headline mb-4"
          style={{ fontSize: `${textSize * 1.1}rem` }}
        >
          {textData.polishTitle}
        </h2>
        <p
          className="italic opacity-70 mb-2"
          style={{ fontSize: `${textSize * 0.8}rem` }}
        >
          {textData.subtitle}
        </p>
        <div
          className="opacity-60 whitespace-pre-line mb-2"
          style={{ fontSize: `${textSize * 0.75}rem` }}
        >
          {textData.author}
        </div>
        <p
          className="font-semibold opacity-70"
          style={{ fontSize: `${textSize * 0.8}rem` }}
        >
          {textData.organization}
        </p>
      </div>

      <hr className="section-divider my-8" />

      {/* Sections */}
      {textData.sections.map((section, sIdx) => (
        <div key={section.number}>
          {/* Section title */}
          <div className="text-center mb-6">
            {section.tibetanTitle && (
              <h3
                className="font-tibetan leading-loose mb-1"
                style={{ fontSize: `${textSize * 1.1}rem` }}
              >
                {section.tibetanTitle}
              </h3>
            )}
            <h3
              className="font-headline"
              style={{ fontSize: `${textSize * 1.05}rem` }}
            >
              {section.title}
            </h3>
          </div>

          {/* Content items */}
          <div className="space-y-3 mb-8">
            {section.content.map((item, idx) => (
              <ContentItemView
                key={idx}
                item={item}
                language={language}
                textSize={textSize}
              />
            ))}
          </div>

          {sIdx < textData.sections.length - 1 && (
            <hr className="section-divider my-8" />
          )}
        </div>
      ))}

      {/* Colophon */}
      <hr className="section-divider my-8" />
      <div className="colophon-block text-center space-y-4 pb-8">
        {textData.colophon.map((line, idx) => (
          <p
            key={idx}
            className="italic opacity-75"
            style={{ fontSize: `${textSize * 0.8}rem` }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
