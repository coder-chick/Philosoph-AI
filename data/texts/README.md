# Philosopher Texts Directory

This directory is for storing classical philosophy texts that will be ingested into Philosoph-AI for RAG (Retrieval-Augmented Generation).

## Directory Structure

Organize your text files by philosopher:

```
data/texts/
├── plato/
│   ├── republic.txt
│   ├── symposium.txt
│   └── apology.txt
├── aristotle/
│   ├── nicomachean-ethics.txt
│   └── politics.txt
├── marcus-aurelius/
│   └── meditations.txt
├── nietzsche/
│   ├── thus-spoke-zarathustra.txt
│   └── beyond-good-and-evil.txt
├── epicurus/
│   └── letter-to-menoeceus.txt
├── confucius/
│   └── analects.txt
├── lao-tzu/
│   └── tao-te-ching.txt
└── socrates/
    └── apology.txt (via Plato)
```

## File Format

- **Format**: Plain text (.txt)
- **Encoding**: UTF-8
- **Size**: Each file should be at least a few KB for meaningful content
- **Content**: Original philosophical texts, translations, or excerpts

## Where to Find Texts

### Public Domain Sources

1. **Project Gutenberg** - https://www.gutenberg.org/
   - Search for: Plato, Aristotle, Marcus Aurelius, etc.
   - Download as Plain Text UTF-8

2. **Internet Archive** - https://archive.org/
   - Extensive classical philosophy collection
   - Multiple translations available

3. **Perseus Digital Library** - http://www.perseus.tufts.edu/
   - Classical Greek and Roman texts
   - Multiple translations

4. **Wikisource** - https://en.wikisource.org/
   - Free classical texts
   - Public domain translations

### Recommended Texts

#### Plato
- The Republic
- The Symposium
- Apology
- Phaedo
- The Laws

#### Aristotle
- Nicomachean Ethics
- Politics
- Metaphysics
- Rhetoric

#### Marcus Aurelius
- Meditations (Gregory Hays or George Long translation)

#### Nietzsche
- Thus Spoke Zarathustra
- Beyond Good and Evil
- On the Genealogy of Morals

#### Epicurus
- Letter to Menoeceus
- Principal Doctrines
- Vatican Sayings

#### Confucius
- The Analects

#### Lao Tzu
- Tao Te Ching

## Uploading to Cloud Storage

Once you have texts in this directory, upload them to Firebase Cloud Storage:

### Option 1: Using gsutil

```powershell
# Upload all texts
gsutil -m cp -r data/texts/plato/* gs://YOUR-PROJECT.appspot.com/philosophers/plato/
gsutil -m cp -r data/texts/aristotle/* gs://YOUR-PROJECT.appspot.com/philosophers/aristotle/
gsutil -m cp -r data/texts/marcus-aurelius/* gs://YOUR-PROJECT.appspot.com/philosophers/marcus-aurelius/
# ... repeat for each philosopher
```

### Option 2: Using Firebase Console

1. Go to Firebase Console → Storage
2. Navigate to `philosophers/` folder
3. Create subfolders for each philosopher
4. Upload .txt files manually

## Running the Ingestion

After uploading texts to Cloud Storage, run the ingestion function:

```powershell
# Trigger the Cloud Function
.\scripts\run-ingestion.ps1
```

This will:
1. Read all .txt files from Cloud Storage
2. Chunk them into ~400 token pieces
3. Generate embeddings using Vertex AI
4. Store embeddings in Firestore

## Testing Locally

You can test with small sample texts first:
1. Add a small test file (e.g., `data/texts/plato/test.txt`)
2. Upload it to Cloud Storage
3. Run the ingestion function
4. Check Firestore for the embeddings collection

## Tips

- Start with 1-2 texts per philosopher to test the system
- Larger texts provide better RAG context
- Clean formatting improves chunk quality
- Remove headers, footers, and page numbers from Project Gutenberg files
- UTF-8 encoding is essential

## File Size Guidelines

- **Minimum**: 10 KB per file (meaningful content)
- **Optimal**: 100 KB - 1 MB per file
- **Maximum**: 10 MB (larger files take longer to process)

## Processing Time

- Small files (< 100 KB): ~10-30 seconds
- Medium files (100 KB - 1 MB): ~1-3 minutes
- Large files (> 1 MB): ~5-10 minutes

The Cloud Function has a 9-minute timeout, so very large collections may need to be processed in batches.
