import fs from 'fs';
import path from 'path';

// Expanded list of philosophers to search for
const targetAuthors = [
  // --- ANCIENT GREEK & ROMAN ---
  'Thales', 'Anaximander', 'Anaximenes', 'Heraclitus', 'Parmenides', 'Zeno of Elea', 'Empedocles', 
  'Anaxagoras', 'Protagoras', 'Gorgias', 'Democritus', 'Pythagoras',
  'Socrates', 'Plato', 'Aristotle', 'Xenophon', 'Aeschines of Sphettus', 'Antisthenes',
  'Epicurus', 'Zeno of Citium', 'Chrysippus', 'Cleanthes', 'Epictetus', 'Seneca', 'Marcus Aurelius', 
  'Sextus Empiricus', 'Diogenes of Sinope', 'Pyrrho',
  'Cicero', 'Lucretius', 'Plutarch', 'Plotinus', 'Porphyry', 'Iamblichus',

  // --- ISLAMIC & MIDDLE EASTERN ---
  'Al-Farabi', 'Al-Kindi', 'Avicenna', 'Ibn Sina', 'Averroes', 'Ibn Rushd', 'Ibn Tufayl', 'Al-Ghazali', 
  'Fakhr al-Din al-Razi', 'Al-Biruni', 'Ibn Khaldun', 'Suhrawardi', 'Maimonides',
  'Ibn Bajjah', 'Ibn Sabin', 'Ibn al-Haytham', 'Al-Jahiz', 'Ibn Arabi', 'Al-Ma\'arri', 'Al-Mutanabbi', 
  'Abu Nuwas', 'Antarah ibn Shaddad', 'Imru\' al-Qais', 'Zuhayr ibn Abi Sulma', 'Tarafa ibn al-Abd', 
  'Labid ibn Rabiah', 'Al-Khwarizmi', 'Ibn al-Muqaffa', 'Al-Maqrizi', 'Ibn Hajar al-Asqalani', 
  'Ibn Yunus', 'Abu Madyan', 'Al-Shushtari',

  // --- MEDIEVAL CHRISTIAN ---
  'Augustine of Hippo', 'Boethius', 'John Scotus Eriugena', 'Anselm of Canterbury', 'Peter Abelard', 
  'Thomas Aquinas', 'Albertus Magnus', 'Duns Scotus', 'William of Ockham', 'Meister Eckhart', 
  'Catherine of Siena', 'Hildegard of Bingen',

  // --- RENAISSANCE & EARLY MODERN ---
  'Niccolo Machiavelli', 'Michel de Montaigne', 'Francis Bacon', 'Rene Descartes', 'Baruch Spinoza', 
  'Blaise Pascal', 'John Locke', 'Gottfried Wilhelm Leibniz', 'George Berkeley', 'David Hume', 
  'Jean-Jacques Rousseau', 'Thomas Reid', 'Montesquieu', 'Adam Smith', 'Immanuel Kant',
  'Erasmus', 'Thomas More', 'Voltaire', 'Denis Diderot', 'Condillac', 'Condorcet', 'La Rochefoucauld', 'La Bruyere',
  'La Mettrie', 'Helvetius', 'Fontenelle', 'Bossuet', 'Fenelon',

  // --- 19TH CENTURY ---
  'Friedrich Schiller', 'Georg Wilhelm Friedrich Hegel', 'Arthur Schopenhauer', 'Soren Kierkegaard', 
  'John Stuart Mill', 'Herbert Spencer', 'Friedrich Nietzsche', 'Henri Bergson', 'William James', 
  'Charles Sanders Peirce', 'Ralph Waldo Emerson', 'Henry David Thoreau', 'Harriet Martineau', 
  'Auguste Comte', 'Karl Marx', 'Alexis de Tocqueville',
  'Proudhon', 'Saint-Simon', 'Fourier', 'Max Stirner', 'Ludwig Feuerbach', 'Wilhelm Dilthey', 
  'Johann Friedrich Herbart', 'Rudolf Hermann Lotze', 'Johann Gottlieb Fichte', 'Friedrich Schelling', 
  'Moses Mendelssohn', 'Leopold von Ranke', 'Wilhelm von Humboldt', 'Heinrich von Treitschke',

  // --- ASIAN PHILOSOPHERS ---
  'Laozi', 'Confucius', 'Mencius', 'Zhuangzi', 'Xunzi', 'Mozi', 'Han Feizi', 'Wang Yangming',
  'Li Bai', 'Du Fu', 'Sima Qian',
  'Vyasa', 'Patanjali', 'Nagarjuna', 'Adi Shankaracharya', 'Buddha', 'Ashvaghosha', 'Valmiki', 'Kalidasa', 
  'Rabindranath Tagore', 'Swami Vivekananda',
  'Dogen', 'Takuan Soho', 'Natsume Soseki', 'Ryunosuke Akutagawa', 'Lafcadio Hearn',

  // --- 20TH CENTURY (Public Domain) ---
  'Josiah Royce', 'Henri Poincare', 'Edmund Husserl', 'Rudolf Steiner', 'Max Weber', 'Oswald Spengler',

  // --- LITERARY & POLITICAL ---
  'Rumi', 'Omar Khayyam', 'Saadi', 'Hafiz', 'Dante Alighieri', 'John Milton', 'Johann Wolfgang von Goethe', 
  'Leo Tolstoy', 'Fyodor Dostoevsky', 'Oscar Wilde', 'Sun Tzu',
  'Homer', 'Herodotus', 'Thucydides', 'Tacitus', 'Aeschylus', 'Sophocles', 'Euripides', 'Aesop',
  'Thomas Paine', 'John Adams', 'Edmund Burke',
  'Honore de Balzac', 'Victor Hugo', 'Alexandre Dumas', 'Emile Zola', 'Gustave Flaubert', 
  'Alphonse de Lamartine', 'Chateaubriand', 'Stendhal', 'Guy de Maupassant', 'Jules Verne', 
  'Charles Baudelaire', 'Arthur Rimbaud', 'Paul Verlaine', 'Stephane Mallarme', 'Theophile Gautier', 
  'Alfred de Musset', 'Alphonse Daudet', 'Madame de Stael', 'George Sand', 'Marie de Gournay', 
  'Madame de Sevigne', 'Emilie du Chatelet', 'Romain Rolland',
  'Thomas Hobbes', 'Jeremy Bentham', 'Mary Wollstonecraft', 'William Whewell',
  'William Shakespeare', 'John Donne', 'Samuel Johnson', 'Samuel Taylor Coleridge', 'William Wordsworth', 
  'Percy Bysshe Shelley', 'Lord Byron', 'John Keats', 'Alfred Lord Tennyson', 'Thomas Carlyle', 
  'Lewis Carroll', 'H. G. Wells', 'Rudyard Kipling', 'Robert Louis Stevenson', 'Charles Dickens', 
  'Charlotte Bronte', 'Emily Bronte', 'Anne Bronte', 'Jane Austen', 'George Eliot',
  'Arnold Toynbee', 'Walter Bagehot',
  'Mark Twain', 'Herman Melville', 'Nathaniel Hawthorne', 'Edgar Allan Poe', 'Walt Whitman', 
  'Emily Dickinson', 'James Fenimore Cooper', 'Jack London', 'Willa Cather', 'Henry James', 
  'Harriet Beecher Stowe', 'Frederick Douglass', 'Booker T. Washington', 'W. E. B. Du Bois',
  'Giambattista Vico', 'Giacomo Leopardi', 'Giovanni Boccaccio', 'Petrarch', 'Benedetto Croce',
  'Anton Chekhov', 'Ivan Turgenev', 'Nikolai Gogol', 'Alexander Pushkin', 'Maxim Gorky', 'Mikhail Lermontov',
  'Miguel de Cervantes', 'Fray Luis de Leon', 'Francisco Suarez', 'Jose de Espronceda', 'Benito Perez Galdos', 'Baltasar Gracian',
  'Luis de Camoes', 'Eca de Queiroz',
  'Nikos Kazantzakis', 'Alexandros Papadiamantis',
  'Henrik Ibsen', 'Hans Christian Andersen', 'Selma Lagerlof', 'Knut Hamsun'
];

const OUTPUT_DIR = path.join(process.cwd(), 'philosophy_data', 'books');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadBooksForAuthor(author: string) {
  console.log(`\n🔍 Searching for works by: ${author}...`);
  
  try {
    // Search Gutendex for the author
    const query = encodeURIComponent(author);
    const searchUrl = `https://gutendex.com/books?search=${query}&sort=popular`;
    
    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await fetch(searchUrl);
        if (response.status === 429 || response.status >= 500) {
           throw new Error(`Server returned ${response.status}`);
        }
        break;
      } catch (e) {
        retries--;
        if (retries === 0) throw e;
        console.log(`   ⏳ Request failed, retrying in 5s...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (!response || !response.ok) {
       console.error(`   ❌ Failed to search for ${author}: ${response?.status} ${response?.statusText}`);
       return;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       const text = await response.text();
       console.error(`   ❌ Invalid response format (not JSON). Status: ${response.status}. Body preview: ${text.substring(0, 100)}...`);
       return;
    }

    const data = await response.json();

    if (data.count === 0 || !data.results) {
      console.log(`   ❌ No results found for ${author}`);
      return;
    }

    // Filter results to ensure the author matches (Gutendex search is broad)
    const relevantBooks = data.results.filter((book: any) => {
      // Check if the target author is actually one of the authors of the book
      return book.authors.some((a: any) => a.name.toLowerCase().includes(author.toLowerCase().split(' ').pop()!.toLowerCase()));
    });

    console.log(`   Found ${relevantBooks.length} relevant books.`);

    // Download top 5 books per author to avoid noise, but "more is better" so let's do top 5
    const booksToDownload = relevantBooks.slice(0, 5);

    for (const book of booksToDownload) {
      const title = book.title;
      const bookId = book.id;
      
      // Check if already downloaded
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50); // Truncate long titles
      const safeAuthor = author.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${safeAuthor}_${safeTitle}_${bookId}.txt`;
      const filePath = path.join(OUTPUT_DIR, filename);

      if (fs.existsSync(filePath)) {
        console.log(`   ⏭️  Skipping (already exists): ${title}`);
        continue;
      }

      // Get text URL
      const formats = book.formats;
      let downloadUrl = formats['text/plain; charset=utf-8'] || formats['text/plain; charset=us-ascii'] || formats['text/plain'];

      if (!downloadUrl) {
        // Try to find a text format ending in .txt if the mime type lookup fails
        const txtUrl = Object.values(formats).find((url: any) => url.endsWith('.txt'));
        if (txtUrl) downloadUrl = txtUrl;
      }

      if (!downloadUrl) {
        console.log(`   ⚠️  No plain text format for: ${title}`);
        continue;
      }

      console.log(`   ⬇️  Downloading: ${title}`);
      
      try {
        const fileResponse = await fetch(downloadUrl as string);
        if (!fileResponse.ok) throw new Error(`HTTP ${fileResponse.status}`);
        const textContent = await fileResponse.text();

        fs.writeFileSync(filePath, textContent);
        console.log(`      ✅ Saved.`);
      } catch (err) {
        console.error(`      ❌ Failed to download ${title}:`, err);
      }
      
      // Be polite to the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

  } catch (error) {
    console.error(`❌ Error processing ${author}:`, error);
  }
}

async function main() {
  console.log('📚 Starting bulk philosophy download...');
  console.log(`Targeting ${targetAuthors.length} authors.`);
  
  for (const author of targetAuthors) {
    await downloadBooksForAuthor(author);
    // Be polite to the API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 All downloads complete!');
}

main();
