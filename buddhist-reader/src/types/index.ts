export type Language = "tibetan" | "transliteration" | "polish";

export type Theme = "light" | "dark" | "sepia";

export type ContentItem =
  | { type: "verse"; tibetan: string; transliteration: string; polish: string }
  | { type: "verse-no-polish"; tibetan: string; transliteration: string }
  | { type: "mantra"; tibetan: string; transliteration: string }
  | { type: "instruction"; tibetan?: string; text: string }
  | { type: "footnote"; text: string };

export interface TextSection {
  number: number;
  tibetanTitle: string;
  title: string;
  content: ContentItem[];
}

export interface TextData {
  id: string;
  tibetanTitle: string;
  transliterationTitle: string;
  polishTitle: string;
  subtitle: string;
  author: string;
  organization: string;
  sections: TextSection[];
  colophon: string[];
}
