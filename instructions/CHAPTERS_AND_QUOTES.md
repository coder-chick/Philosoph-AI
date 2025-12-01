📄 CHAPTERS_AND_QUOTES.md
📘 Chapters, Quotes & Source Linking Specification for Philosoph-AI

This document describes how Philosoph-AI must support:

Quote extraction

Chapter detection

Metadata storage

Chunk-to-chapter mapping

Deep links to original Project Gutenberg HTML chapters

Optional internal chapter-view pages

This file is for AI assistants (including GitHub Copilot) to reference while generating ingestion scripts, Firestore schemas, and UI features.

🧩 1. Input Format: Plain .txt Files

All philosopher texts are stored as cleaned UTF-8 .txt files in Google Cloud Storage.

Copilot must assume:

Files contain natural chapter headers (CHAPTER I, BOOK IV, PART TWO, etc.).

Files may contain Gutenberg headers/footers (must be removed).

No HTML markup or structural metadata.

The ingestion system must make .txt files fully usable for:

Quotes

Chapter references

Citation blocks

Contextual RAG answers

🧠 2. Chapter Detection Rules

Copilot must implement chapter detection using regex-based header matching.

Recognize these patterns:

CHAPTER I
CHAPTER 1
BOOK I
PART II
SECTION III
ARGUMENT.


Regex patterns Copilot should use:

^(BOOK|CHAPTER|PART|SECTION)\s+([A-Z0-9]+)[\.\s]*$


or

^([IVXLCDM]+)\.$

For each detected chapter:

Store:

chapterName (e.g., "Book IV, Chapter II")

chapterNumber (if applicable)

startLine (line number in the TXT)

startIndex (character index)

startChunkIndex (after chunking)

All chapter metadata must be written to Firestore under:

/documents/{docId}/chapters/{chapterId}

📦 3. Chunking Rules

Chunks are generated after chapter detection.

Copilot must:

produce ~500–1000 token chunks

maintain order

annotate each chunk with:

chunkIndex

chapterName

chapterId

bookId

docId

positionInChapter (% offset)

Chunk structure example:

{
  "chunkIndex": 42,
  "content": "…text…",
  "chapter": "Book IV, Chapter II",
  "chapterId": "book4_ch2",
  "positionInChapter": 0.14,
  "sourceFile": "republic.txt",
  "philosopherId": "plato",
  "embedding": [ ... ]
}

📝 4. Quote Extraction

When answering a question using RAG:

The retrieved chunk must be scanned for the best matching 1–3 sentences.

Copilot must implement a helper function to find relevant sentences using:

sentence splitting

overlap with the question

or vector similarity (optional)

Quote output format:

{
  "quote": "Justice is the harmony of the soul.",
  "source": "Plato — Republic, Book IV, Chapter II"
}


The API response must include:

"quote": string | null
"source": {
   "chapter": string,
   "chapterLink": string | null,
   "chunkIndex": number
}

🔗 5. Linking to Original Chapters (Project Gutenberg HTML)

Copilot must generate an optional field:

chapterLink


This should map:

The TXT chapter →

The equivalent Project Gutenberg HTML chapter anchor

Example:

TXT:

Book IV, Chapter II


Gutenberg HTML:

https://www.gutenberg.org/files/1497/1497-h/1497-h.htm#CHAPTER_IV_2


Mapping approach:

A JSON dictionary in your codebase:

/philosopher_metadata/plato_republic_anchors.json


A heuristic (e.g., normalize chapter names → uppercase → underscores)

Manual overrides allowed

If mapping is unknown, set:

chapterLink = null

🏛️ 6. Internal Chapter Display (Optional Feature)

Copilot should support an /chapters route:

Example URL:

/chapters/plato/republic/book4/chapter2


This page displays:

The full text of the chapter

Metadata

The retrieved chunk highlighted if coming from an answer

Data source:

Chapters reconstructed from TXT

or reassembled from stored chunks in Firestore

📊 7. Firestore Schema Updates
embeddings collection:
{
  "philosopherId": "plato",
  "docId": "republic",
  "chunkIndex": 42,
  "chapterId": "book4_ch2",
  "chapterName": "Book IV, Chapter II",
  "content": "...",
  "embedding": [...],
  "sourceFile": "republic.txt",
  "positionInChapter": 0.14
}

documents/{docId}/chapters/{chapterId}:
{
  "chapterId": "book4_ch2",
  "chapterName": "Book IV, Chapter II",
  "startLine": 1200,
  "startChunkIndex": 37,
  "sourceFile": "republic.txt"
}

🎯 8. Usage in the AI Response

When answering a user question, the final API response must include:

{
  "answer": "...",
  "quote": "…",
  "source": {
    "chapter": "Book IV, Chapter II",
    "chapterLink": "https://www.gutenberg.org/...",
    "chunkIndex": 42
  }
}


The UI must display:

Styled answer

Styled quote block

Hyperlink to chapter (if available)

Citation footnote

🤖 9. Implementation Notes for GitHub Copilot

Copilot should:

Parse TXT files line-by-line

Detect chapter boundaries

Chunk text after chapter mapping

Assign chapter metadata to chunks

Generate a metadata JSON file

Store embeddings + metadata in Firestore

Implement getQuoteFromChunk()

Add RAG-based quote injection to /api/ask

Add deep chapter links to responses

Build a chapter-view UI route