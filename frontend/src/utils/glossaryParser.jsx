import React from "react";
import GlossaryTooltip from "../components/GlossaryTooltip";
import glossaryData from "../data/glossary.json";

// Extract terms and sort by length descending (so "magnetic field" matches before "field")
const terms = Object.keys(glossaryData).sort((a, b) => b.length - a.length);

// Escape terms for regex
const escapedTerms = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

// Create a case-insensitive regex for whole word matches
const regex = new RegExp(`\\b(${escapedTerms.join("|")})\\b`, "gi");

export const parseGlossary = (text) => {
  if (!text || typeof text !== "string") return text;

  // If there are no terms, return original text
  if (terms.length === 0) return text;

  const parts = [];
  let lastIndex = 0;
  let match;

  // Reset regex state
  regex.lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const matchedTerm = match[0];
    const termKey = matchedTerm.toLowerCase();
    const termData = glossaryData[termKey];

    if (termData) {
      parts.push(
        <GlossaryTooltip
          key={`${termKey}-${match.index}`}
          term={matchedTerm}
          definition={termData.definition}
          subject={termData.subject}
        />
      );
    } else {
      parts.push(matchedTerm);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};
