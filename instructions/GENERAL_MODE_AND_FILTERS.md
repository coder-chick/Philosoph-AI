📄 GENERAL_MODE_AND_FILTERS.md
🌐 General Mode, Automatic Categorization & Filters Specification for Philosoph-AI

This document describes how Philosoph-AI must handle:

General questions from users who don’t know philosophy

Automatic categorization & theme detection

Auto-selection of relevant philosophers

Multi-perspective answers without the user asking

Filtering by time period (century)

Filtering by geographic area or philosophical tradition

This file is intended for GitHub Copilot and other AI assistants to use as reference when generating code.

🧠 1. Automatic General Question Mode

If the user asks a question without selecting a philosopher, OR if they ask something extremely broad, OR if the question does not clearly map to an existing persona, Philosoph-AI must:

✔ Automatically switch to General Mode
✔ Detect the philosophical themes in the question
✔ Select the top 3–6 philosophers whose works fit the theme
✔ Provide a structured, multi-perspective answer
✔ Include optional quotes & chapter references
✔ Recommend which philosopher(s) the user should explore next

User does NOT need to ask for “different perspectives.”
Multi-perspective responses happen automatically when relevant.

🧭 2. Theme Detection System

To classify general questions, Copilot must implement a theme-detector module.

Input:

User question text.

Output:

Top themes (score-ranked), e.g.:

{
  "themes": [
    { "name": "ethics", "score": 0.93 },
    { "name": "free will", "score": 0.71 }
  ]
}

Methods:

Vertex Embeddings Similarity
Compare the question vector to predefined theme vectors.

Optional Gemini 1.5 reasoning pass
(“Classify the question into philosophical domains.”)

Core themes:

Ethics

Morality

Knowledge (epistemology)

Reality (metaphysics)

Justice / Society

Identity / Self

Free Will / Determinism

Meaning / Purpose

Emotion / Desire

Logic / Reason

Politics / Power

Aesthetics

These must be stored in a static file:

/philosophy_data/themes.json

🧩 3. Automatic Philosopher Selection

Based on detected themes, the system chooses 3–6 philosophers.

Example:

Theme = “free will”
Select:

Kant

Nietzsche

Sartre

Stoics

Schopenhauer

Copilot must maintain a mapping file in:

/philosophy_data/theme_to_philosophers.json


Example structure:

{
  "free will": ["kant", "nietzsche", "sartre", "stoics"],
  "justice": ["plato", "aristotle", "rawls"],
  "knowledge": ["plato", "descartes", "locke", "hume"]
}


The general mode response must use this list.

🎭 4. Multi-Perspective Answer Format

All general-mode answers must follow a consistent structure:

(A) General Overview

A concise, modern explanation of the concept.

(B) Multi-Perspective Breakdown

3–6 sections, each containing:

Philosopher name

Short bio (1–2 lines)

Core perspective (3–5 lines)

Optional quote + citation

Optional chapter link

(C) Optional Comparison

Highlight differences between the perspectives.

(D) Recommendation

Suggest who to read next based on user's interests.

🌎 5. Geographic Selection Feature

Users may optionally choose philosophers by region.

Copilot must support filtering by:

Regions:

Ancient Greece

Roman / Latin

Medieval Europe

Islamic Golden Age

Continental Europe

British Empiricists

German Idealists

French Rationalists

American Pragmatists

Modern Europe

East Asian Traditions (only if public domain)

Middle Eastern Philosophers

North African Philosophers

This mapping must exist in:

/philosophy_data/regions.json


Example:

{
  "ancient_greece": ["plato", "aristotle", "epicurus"],
  "german_idealists": ["kant", "hegel", "fichte"],
  "french_modern": ["montaigne", "rousseau", "descartes"]
}

UI Feature:

A dropdown or filter panel where user can select:

Region

OR “Global Overview” (default)

🕰 6. Century and Time-Period Filters

Users may optionally select philosophers by century or era.

Examples:

“5th century BC”

“17th century philosophy”

“Medieval”

“Enlightenment”

“19th century existentialism”

Copilot must store century metadata for each philosopher in:

/philosophy_data/philosophers.json


Example:

{
  "plato": {
    "name": "Plato",
    "century": -4,
    "region": "ancient_greece",
    "themes": ["ethics", "justice", "metaphysics"]
  },
  "kant": {
    "century": 18,
    "region": "german_idealists",
    "themes": ["ethics", "duty", "free will"]
  }
}

When a filter is applied:

General mode must only choose philosophers matching the filter.

🧹 7. Combining Filters

The system must support combined filtering:

“Show me perspectives on anger from ancient philosophers”

“Explain justice from 19th-century thinkers”

“Give me perspectives from Islamic Golden Age philosophers”

“Explain happiness from those before the Enlightenment”

Copilot must implement logic:

filtered = allPhilosophers
    .filter(p => matchesTheme(p, theme))
    .filter(p => matchesRegion(p, regionFilter))
    .filter(p => matchesCentury(p, centuryFilter))


Only after filtering → select top 3–6.

🔄 8. Fallback Rules

If filtering yields too few philosophers:

If 0 → automatically expand to “global overview”

If 1–2 → include adjacent traditions or centuries

If ambiguous → ask clarifying questions (optional)

🎨 9. UI Requirements
For general questions:

Show:

Summary at top

A row of philosopher cards (perspectives)

Expandable quote sections

Citations

“Explore more from this era” links

For region/century filters:

Use:

Side filter panel

Chips/badges in mobile

Clear reset button

🧪 10. API Requirements (General Mode)

Add new fields to /api/ask request:

{
  "mode": "general",
  "region": null,
  "century": null
}


Response:

{
  "overview": "...",
  "perspectives": [
    {
      "philosopherId": "plato",
      "summary": "...",
      "quote": "...",
      "source": {
        "chapter": "Book IV, Chapter II",
        "link": "https://gutenberg.org/..."
      }
    }
  ],
  "theme": "justice",
  "recommendations": ["plato", "rawls", "aristotle"]
}

🧰 11. Files Copilot Must Rely On

Copilot should reference these files:

/philosophy_data/themes.json
/philosophy_data/philosophers.json
/philosophy_data/theme_to_philosophers.json
/philosophy_data/regions.json
/philosophy_data/centuries.json (optional)
/general_mode/


These may be static JSON or TypeScript exports.

🎯 12. Implementation Priorities

Copilot should tackle features in this order:

Automatic general mode

Theme detection

Theme → philosopher mapping

Multi-perspective answer generator

Region filter

Century filter

Combined filters

UI to display everything cleanly