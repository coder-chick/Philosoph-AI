import themes from '@/philosophy_data/themes.json';
import themeToPhilosophers from '@/philosophy_data/theme_to_philosophers.json';

export interface DetectedTheme {
  name: string;
  score: number;
  description: string;
}

export interface ThemeDetectionResult {
  themes: DetectedTheme[];
  suggestedPhilosophers: string[];
}

/**
 * Detect philosophical themes in a question using keyword matching
 */
export function detectThemes(question: string): ThemeDetectionResult {
  const normalizedQuestion = question.toLowerCase();
  const themeScores: { [key: string]: number } = {};

  // Calculate scores for each theme based on keyword matches
  Object.entries(themes).forEach(([themeName, themeData]) => {
    let score = 0;
    themeData.keywords.forEach((keyword) => {
      if (normalizedQuestion.includes(keyword.toLowerCase())) {
        // Give higher weight to exact word matches
        const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
        const matches = normalizedQuestion.match(regex);
        if (matches) {
          score += matches.length * 0.3;
        } else if (normalizedQuestion.includes(keyword.toLowerCase())) {
          score += 0.1;
        }
      }
    });
    
    if (score > 0) {
      themeScores[themeName] = score;
    }
  });

  // Sort themes by score
  const sortedThemes = Object.entries(themeScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, score]) => ({
      name,
      score: Math.min(score, 1), // Normalize to 0-1
      description: themes[name as keyof typeof themes]?.description || '',
    }));

  // Get suggested philosophers based on top themes
  const philosopherSet = new Set<string>();
  sortedThemes.forEach((theme) => {
    const philosophers = themeToPhilosophers[theme.name as keyof typeof themeToPhilosophers];
    if (philosophers) {
      philosophers.forEach((p) => philosopherSet.add(p));
    }
  });

  return {
    themes: sortedThemes,
    suggestedPhilosophers: Array.from(philosopherSet).slice(0, 6),
  };
}

/**
 * Determine if a question should trigger general mode
 */
export function shouldUseGeneralMode(
  question: string,
  selectedPhilosopher: string | null
): boolean {
  // Use general mode if no philosopher selected
  if (!selectedPhilosopher) return true;

  // Use general mode for very broad questions
  const broadKeywords = [
    'what is',
    'explain',
    'tell me about',
    'different perspectives',
    'how do philosophers',
    'philosophical views',
    'philosophy of',
  ];

  const normalizedQuestion = question.toLowerCase();
  return broadKeywords.some((keyword) => normalizedQuestion.includes(keyword));
}

/**
 * Get theme display name
 */
export function getThemeDisplayName(themeName: string): string {
  const displayNames: { [key: string]: string } = {
    ethics: 'Ethics & Morality',
    justice: 'Justice & Society',
    knowledge: 'Knowledge & Truth',
    reality: 'Reality & Existence',
    meaning: 'Meaning & Purpose',
    free_will: 'Free Will & Choice',
    happiness: 'Happiness & Well-being',
    self: 'Self & Identity',
    emotion: 'Emotions & Feelings',
    reason: 'Reason & Logic',
    death: 'Death & Mortality',
    power: 'Power & Authority',
    beauty: 'Beauty & Aesthetics',
    suffering: 'Suffering & Hardship',
    friendship: 'Friendship & Relationships',
  };

  return displayNames[themeName] || themeName;
}
