"use client";

import React from "react";
import { useReader } from "@/context/ReaderContext";
import { TextData, ContentItem, Language } from "@/types";

interface TextContentProps {
  textData: TextData;
}

function VerseBlock({
  item,
  selectedLanguages,
  textSize,
}: {
  item: ContentItem & { type: "verse" | "verse-no-polish" };
  selectedLanguages: Language[];
  textSize: number;
}) {
  const showTibetan = selectedLanguages.includes("tibetan");
  const showTranslit = selectedLanguages.includes("transliteration");
  const showPolish = selectedLanguages.includes("polish");

  return (
    <div className="verse-block-group mb-4">
      {showTibetan && (
        <p
          className="font-tibetan leading-loose text-center"
          style={{ fontSize: `${textSize}rem` }}
        >
          {item.tibetan}
        </p>
      )}
      {showTranslit && (
        <p
          className="font-body tracking-wide text-center opacity-80"
          style={{ fontSize: `${textSize * 0.85}rem` }}
        >
          {item.transliteration}
        </p>
      )}
      {showPolish && item.type === "verse" && (
        <p
          className="font-body text-center italic opacity-75"
          style={{ fontSize: `${textSize * 0.85}rem` }}
        >
          {item.polish}
        </p>
      )}
      {showPolish && item.type === "verse-no-polish" && !showTranslit && (
        <p
          className="font-body tracking-wide text-center italic opacity-60"
          style={{ fontSize: `${textSize * 0.8}rem` }}
        >
          {item.transliteration}
        </p>
      )}
    </div>
  );
}

function MantraBlock({
  item,
  selectedLanguages,
  textSize,
}: {
  item: ContentItem & { type: "mantra" };
  selectedLanguages: Language[];
  textSize: number;
}) {
  const showTibetan = selectedLanguages.includes("tibetan");
  const showTranslit = selectedLanguages.includes("transliteration");
  const showPolish = selectedLanguages.includes("polish");

  return (
    <div className="mantra-block my-6 py-4 text-center">
      {showTibetan && (
        <p
          className="font-tibetan leading-loose font-bold"
          style={{ fontSize: `${textSize * 1.3}rem` }}
        >
          {item.tibetan}
        </p>
      )}
      {(showTranslit || showPolish) && (
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

function InstructionBlock({
  item,
  selectedLanguages,
  textSize,
}: {
  item: ContentItem & { type: "instruction" };
  selectedLanguages: Language[];
  textSize: number;
}) {
  const showTibetan = selectedLanguages.includes("tibetan");
  const showPolish = selectedLanguages.includes("polish");

  return (
    <div
      className="instruction-block my-4 px-4 py-3 rounded-lg"
      style={{ fontSize: `${textSize * 0.85}rem` }}
    >
      {showTibetan && item.tibetan && (
        <p className="font-tibetan leading-loose mb-2">
          {item.tibetan}
        </p>
      )}
      {showPolish && (
        <p className="italic opacity-85">{item.text}</p>
      )}
      {!showPolish && !showTibetan && (
        <p className="italic opacity-85">{item.text}</p>
      )}
    </div>
  );
}

function ContentItemView({
  item,
  selectedLanguages,
  textSize,
}: {
  item: ContentItem;
  selectedLanguages: Language[];
  textSize: number;
}) {
  switch (item.type) {
    case "verse":
    case "verse-no-polish":
      return (
        <VerseBlock
          item={item}
          selectedLanguages={selectedLanguages}
          textSize={textSize}
        />
      );
    case "mantra":
      return (
        <MantraBlock
          item={item}
          selectedLanguages={selectedLanguages}
          textSize={textSize}
        />
      );
    case "instruction":
      return (
        <InstructionBlock
          item={item}
          selectedLanguages={selectedLanguages}
          textSize={textSize}
        />
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
  const { selectedLanguages, textSize } = useReader();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      {/* Title block */}
      <div className="text-center mb-10">
        {selectedLanguages.includes("tibetan") && (
          <h1
            className="font-tibetan leading-loose mb-2"
            style={{ fontSize: `${textSize * 1.6}rem` }}
          >
            {textData.tibetanTitle}
          </h1>
        )}
        {selectedLanguages.includes("transliteration") && (
          <h2
            className="tracking-widest mb-3 opacity-80"
            style={{ fontSize: `${textSize * 0.9}rem` }}
          >
            {textData.transliterationTitle}
          </h2>
        )}
        {selectedLanguages.includes("polish") && (
          <>
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
          </>
        )}
      </div>

      <hr className="section-divider my-8" />

      {/* Sections */}
      {textData.sections.map((section, sIdx) => (
        <div key={section.number}>
          {/* Section title */}
          <div className="text-center mb-6">
            {section.tibetanTitle &&
              selectedLanguages.includes("tibetan") && (
                <h3
                  className="font-tibetan leading-loose mb-1"
                  style={{ fontSize: `${textSize * 1.1}rem` }}
                >
                  {section.tibetanTitle}
                </h3>
              )}
            {selectedLanguages.includes("polish") && (
              <h3
                className="font-headline"
                style={{ fontSize: `${textSize * 1.05}rem` }}
              >
                {section.title}
              </h3>
            )}
          </div>

          {/* Content items */}
          <div className="space-y-1 mb-8">
            {section.content.map((item, idx) => (
              <ContentItemView
                key={idx}
                item={item}
                selectedLanguages={selectedLanguages}
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
      {selectedLanguages.includes("polish") && (
        <>
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
        </>
      )}
    </div>
  );
}
