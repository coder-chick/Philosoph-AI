import { NextRequest, NextResponse } from 'next/server';
import { getPhilosopherById, buildSystemPrompt, getAllPhilosophers } from '@/lib/philosophers';
import { generateContent } from '@/lib/vertexClient';
import { performRAG } from '@/lib/rag';
import { detectThemes } from '@/lib/themeDetector';
import philosophersData from '@/philosophy_data/philosophers.json';
import regionsData from '@/philosophy_data/regions.json';

export async function POST(request: NextRequest) {
  try {
    const { philosopherId, question, sessionId, useRAG = false, mode = 'single', region = 'all', century = 'all' } = await request.json();

    // Validate input
    if (!question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      );
    }

    // Handle General Mode (multi-perspective)
    if (mode === 'general') {
      // Century ranges for filtering
      const centuryRanges: Record<string, (c: number) => boolean> = {
        all: () => true,
        ancient: (c) => c <= 5 && c >= -10,
        medieval: (c) => c > 5 && c <= 15,
        enlightenment: (c) => c > 15 && c <= 18,
        modern: (c) => c > 18
      };

      // Get available philosophers based on region
      const regionPhilosophers = region === 'all'
        ? Object.keys(philosophersData)
        : regionsData[region as keyof typeof regionsData]?.philosophers || [];

      // Filter by century
      const centuryFilter = centuryRanges[century] || centuryRanges.all;
      const availablePhilosophers = regionPhilosophers.filter(id => {
        const pData = philosophersData[id as keyof typeof philosophersData];
        return pData && centuryFilter(pData.century);
      });

      // If filtering yields too few philosophers, expand to all
      if (availablePhilosophers.length === 0) {
        availablePhilosophers.push(...Object.keys(philosophersData).slice(0, 3));
      } else if (availablePhilosophers.length === 1) {
        // Add adjacent philosophers if only one matches
        const allPhils = Object.keys(philosophersData);
        const idx = allPhils.indexOf(availablePhilosophers[0]);
        if (idx > 0) availablePhilosophers.push(allPhils[idx - 1]);
        if (idx < allPhils.length - 1) availablePhilosophers.push(allPhils[idx + 1]);
      }

      // Detect themes to select relevant philosophers
      const themeData = detectThemes(question);
      const suggestedPhilosopherIds = themeData.suggestedPhilosophers;
      
      // Select top 3-6 philosophers that match filters and themes
      let selectedPhilosopherIds = suggestedPhilosopherIds
        .filter(id => availablePhilosophers.includes(id))
        .slice(0, 4);

      // If no theme matches, pick from available
      if (selectedPhilosopherIds.length === 0) {
        selectedPhilosopherIds = availablePhilosophers.slice(0, 3);
      } else if (selectedPhilosopherIds.length < 2) {
        // Ensure at least 2 perspectives
        const remaining = availablePhilosophers.filter(id => !selectedPhilosopherIds.includes(id));
        selectedPhilosopherIds.push(...remaining.slice(0, 2));
      }

      // Generate responses from each philosopher
      const perspectives = await Promise.all(
        selectedPhilosopherIds.map(async (id) => {
          const philosopher = getPhilosopherById(id);
          if (!philosopher) return null;

          const systemPrompt = buildSystemPrompt(philosopher, '');
          const result = await generateContent({
            systemPrompt,
            userPrompt: `Answer this question briefly (3-4 sentences): ${question}`,
            temperature: 0.7,
            maxOutputTokens: 512,
          });

          return {
            philosopher: id,
            name: philosopher.name,
            bio: `${philosopher.period}, ${philosopher.school}`,
            response: result.text || 'No response generated',
            // Placeholder for future RAG integration
            quote: null,
            source: null
          };
        })
      );

      // Filter out null responses
      const validPerspectives = perspectives.filter(p => p !== null);

      // Generate overview with comparison
      const overviewPrompt = `You are synthesizing wisdom from multiple philosophical traditions. 
The question is: "${question}"

Here are perspectives from different philosophers:
${validPerspectives.map(p => `- ${p!.name}: ${p!.response}`).join('\n')}

Provide:
1. A brief 2-3 sentence overview highlighting the key insights
2. Note any interesting contrasts or complementary viewpoints`;

      const overviewResult = await generateContent({
        systemPrompt: 'You are a philosophical synthesizer providing clear, accessible overviews.',
        userPrompt: overviewPrompt,
        temperature: 0.6,
        maxOutputTokens: 384,
      });

      // Generate recommendations
      const primaryPhilosophers = selectedPhilosopherIds.slice(0, 3);
      const recommendations = [
        ...primaryPhilosophers,
        // Add diverse recommendations from other traditions
        ...Object.keys(philosophersData)
          .filter(id => !primaryPhilosophers.includes(id))
          .slice(0, 2)
      ];

      return NextResponse.json({
        mode: 'general',
        overview: overviewResult.text || 'Multiple perspectives on your question:',
        perspectives: validPerspectives,
        themes: themeData.themes.slice(0, 3).map(t => t.name),
        recommendations: recommendations,
        filtersApplied: {
          region: region !== 'all' ? region : null,
          century: century !== 'all' ? century : null,
          expandedFilters: availablePhilosophers.length < 2
        },
        sessionId,
      });
    }

    // Handle Single Philosopher Mode (existing logic)
    if (!philosopherId) {
      return NextResponse.json(
        { error: 'Missing required field: philosopherId for single mode' },
        { status: 400 }
      );
    }

    // Get philosopher
    const philosopher = getPhilosopherById(philosopherId);
    if (!philosopher) {
      return NextResponse.json(
        { error: 'Invalid philosopher ID' },
        { status: 404 }
      );
    }

    // Perform RAG retrieval if enabled
    let ragContext = '';
    let hasRagContext = false;
    let sources: string[] = [];

    if (useRAG) {
      const ragResult = await performRAG(question, philosopherId, {
        enabled: true,
        topK: 3,
      });
      ragContext = ragResult.context;
      hasRagContext = ragResult.hasContext;
      sources = ragResult.sources;
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(philosopher, ragContext);

    // Generate response using Vertex AI
    const result = await generateContent({
      systemPrompt,
      userPrompt: question,
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    if (result.error) {
      console.error('Vertex AI error:', result.error);
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      answer: result.text,
      philosopherId,
      hasRagContext,
      sources: hasRagContext ? sources : undefined,
      sessionId,
    });
  } catch (error) {
    console.error('Error in /api/ask:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
