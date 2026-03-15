export type Language = "tibetan" | "transliteration" | "english" | "sanskrit";

export type Theme = "light" | "dark" | "sepia";

export interface TextSection {
  number: number;
  title: Record<Language, string>;
  content: Record<Language, string[]>;
}

export interface GlossaryEntry {
  term: string;
  english: string;
  sanskrit: string;
  tibetan: string;
}

export interface TextData {
  id: string;
  title: Record<Language, string>;
  sections: TextSection[];
  glossary: GlossaryEntry[];
}
