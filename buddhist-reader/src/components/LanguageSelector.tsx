"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useReader } from "@/context/ReaderContext";
import { Language } from "@/types";

const languages: { key: Language; label: string; short: string }[] = [
  { key: "tibetan", label: "བོད་ཡིག", short: "TIB" },
  { key: "transliteration", label: "Wylie", short: "WYL" },
  { key: "english", label: "English", short: "ENG" },
  { key: "sanskrit", label: "संस्कृत", short: "SKT" },
];

export function LanguageSelector() {
  const { language, setLanguage } = useReader();

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {languages.map((lang) => (
        <Button
          key={lang.key}
          variant="ghost"
          size="default"
          onClick={() => setLanguage(lang.key)}
          className={`text-xs px-3 py-1 h-7 ${
            language === lang.key ? "active-button" : ""
          }`}
        >
          <span className="hidden sm:inline">{lang.label}</span>
          <span className="sm:hidden">{lang.short}</span>
        </Button>
      ))}
    </div>
  );
}
