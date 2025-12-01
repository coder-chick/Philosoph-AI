'use client';

import { useState, useEffect, useRef } from 'react';
import { getAllPhilosophers, type Philosopher } from '@/lib/philosophers';
import { detectThemes } from '@/lib/themeDetector';
import { v4 as uuidv4 } from 'uuid';
import philosophersData from '@/philosophy_data/philosophers.json';
import regionsData from '@/philosophy_data/regions.json';

interface Perspective {
  philosopher: string;
  name: string;
  bio: string;
  response: string;
  quote?: string | null;
  source?: { chapter?: string; link?: string } | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  philosopherId?: string;
  timestamp: Date;
  perspectives?: Perspective[];
  themes?: string[];
  recommendations?: string[];
}

type Region = 'all' | 'ancient_greece' | 'roman_latin' | 'german_idealists' | 'east_asian';

type CenturyFilter = 'all' | 'ancient' | 'medieval' | 'enlightenment' | 'modern';

export default function Home() {
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<Philosopher | null>(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [isGeneralMode, setIsGeneralMode] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
  const [selectedCentury, setSelectedCentury] = useState<CenturyFilter>('all');
  const [expandedPerspectives, setExpandedPerspectives] = useState<Set<string>>(new Set());
  const [showPhilosopherSelect, setShowPhilosopherSelect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const philosophers = getAllPhilosophers();

  // Century ranges for filtering
  const centuryRanges: Record<CenturyFilter, (century: number) => boolean> = {
    all: () => true,
    ancient: (c) => c <= 5 && c >= -10,
    medieval: (c) => c > 5 && c <= 15,
    enlightenment: (c) => c > 15 && c <= 18,
    modern: (c) => c > 18
  };

  // Filter philosophers by region and century
  const filteredPhilosophers = philosophers.filter(p => {
    const pData = philosophersData[p.id as keyof typeof philosophersData];
    if (!pData) return false;
    
    // Check region filter
    const regionPhilosophers = selectedRegion === 'all' 
      ? Object.keys(philosophersData)
      : regionsData[selectedRegion]?.philosophers || [];
    
    if (!regionPhilosophers.includes(p.id)) return false;
    
    // Check century filter
    return centuryRanges[selectedCentury](pData.century);
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAsk = async () => {
    if (!question.trim() || isLoading) return;
    if (!isGeneralMode && !selectedPhilosopher) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      if (isGeneralMode) {
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            question: userMessage.content, 
            mode: 'general',
            region: selectedRegion,
            century: selectedCentury,
            sessionId
          }),
        });

        const data = await response.json();
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: data.overview || data.answer || '',
          perspectives: data.perspectives || [],
          themes: data.themes || [],
          recommendations: data.recommendations || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            philosopherId: selectedPhilosopher!.id,
            question: userMessage.content,
            sessionId,
          }),
        });

        const data = await response.json();
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: data.answer,
          philosopherId: selectedPhilosopher!.id,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        await fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: userMessage.content,
            answer: data.answer,
            philosopherId: selectedPhilosopher!.id,
            sessionId,
            hasRagContext: data.hasRagContext || false,
          }),
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSelectedPhilosopher(null);
    setIsGeneralMode(false);
    setShowPhilosopherSelect(false);
    setSelectedRegion('all');
    setSelectedCentury('all');
  };

  // If no philosopher selected and not in general mode, show selection
  if (!selectedPhilosopher && !isGeneralMode) {
    return (
      <div className="flex h-screen bg-[#0f1419]">
        {/* Sidebar */}
        <div className="w-72 bg-[#1a1f2e] border-r border-[#2a3441] flex flex-col">
          <div className="p-4 border-b border-[#2a3441]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Chat History</h2>
              <button
                onClick={startNewChat}
                className="text-[#6c7a89] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white text-sm placeholder-[#6c7a89] focus:outline-none focus:border-[#4a90e2]"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="text-[#6c7a89] text-xs font-semibold mb-2">Today</div>
              <button className="w-full text-left px-3 py-2 rounded-lg bg-[#2a3441] text-white text-sm hover:bg-[#3a4451] transition-colors">
                New Chat
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-[#2a3441]">
            <button 
              onClick={startNewChat}
              className="w-full px-4 py-2 bg-[#2a3441] text-white rounded-lg hover:bg-[#3a4451] transition-colors text-sm"
            >
              Delete Chat History
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4">
                Philosoph<span className="text-[#4a90e2]">AI</span>
              </h1>
              <p className="text-[#8b95a5] text-lg">
                Choose a philosopher to begin your conversation
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-[#1a1f2e] rounded-xl p-1 border border-[#2a3441]">
                <button
                  onClick={() => setIsGeneralMode(false)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isGeneralMode
                      ? 'bg-[#4a90e2] text-white'
                      : 'text-[#8b95a5] hover:text-white'
                  }`}
                >
                  Single Philosopher
                </button>
                <button
                  onClick={() => {
                    setIsGeneralMode(true);
                    setSelectedPhilosopher(null);
                  }}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isGeneralMode
                      ? 'bg-[#4a90e2] text-white'
                      : 'text-[#8b95a5] hover:text-white'
                  }`}
                >
                  Group Discussion
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 justify-center flex-wrap">
              {/* Region Filter */}
              <div className="flex flex-col">
                <label className="text-[#8b95a5] text-xs mb-2 font-semibold uppercase tracking-wide">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as Region)}
                  className="bg-[#1a1f2e] text-white border border-[#2a3441] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#4a90e2] min-w-[180px]"
                >
                  <option value="all">All Traditions</option>
                  <option value="ancient_greece">Ancient Greece</option>
                  <option value="roman_latin">Roman / Latin</option>
                  <option value="german_idealists">German Idealists</option>
                  <option value="east_asian">East Asian</option>
                </select>
              </div>

              {/* Century Filter */}
              <div className="flex flex-col">
                <label className="text-[#8b95a5] text-xs mb-2 font-semibold uppercase tracking-wide">Time Period</label>
                <select
                  value={selectedCentury}
                  onChange={(e) => setSelectedCentury(e.target.value as CenturyFilter)}
                  className="bg-[#1a1f2e] text-white border border-[#2a3441] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#4a90e2] min-w-[180px]"
                >
                  <option value="all">All Periods</option>
                  <option value="ancient">Ancient (Before 500 CE)</option>
                  <option value="medieval">Medieval (500-1500)</option>
                  <option value="enlightenment">Enlightenment (1500-1800)</option>
                  <option value="modern">Modern (1800+)</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedRegion !== 'all' || selectedCentury !== 'all') && (
              <div className="flex justify-center mb-4 gap-2">
                {selectedRegion !== 'all' && (
                  <div className="inline-flex items-center bg-[#4a90e2] text-white px-3 py-1 rounded-full text-xs">
                    {regionsData[selectedRegion]?.name}
                    <button
                      onClick={() => setSelectedRegion('all')}
                      className="ml-2 hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                )}
                {selectedCentury !== 'all' && (
                  <div className="inline-flex items-center bg-[#4a90e2] text-white px-3 py-1 rounded-full text-xs">
                    {selectedCentury.charAt(0).toUpperCase() + selectedCentury.slice(1)}
                    <button
                      onClick={() => setSelectedCentury('all')}
                      className="ml-2 hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* No Results Message */}
            {filteredPhilosophers.length === 0 && (
              <div className="text-center py-8 mb-6">
                <p className="text-[#8b95a5] text-lg mb-2">No philosophers match your filters</p>
                <button
                  onClick={() => {
                    setSelectedRegion('all');
                    setSelectedCentury('all');
                  }}
                  className="text-[#4a90e2] hover:text-[#357abd] text-sm underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Philosopher Grid */}
            {filteredPhilosophers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredPhilosophers.map((philosopher) => (
                <button
                  key={philosopher.id}
                  onClick={() => setSelectedPhilosopher(philosopher)}
                  className="group bg-[#1a1f2e] rounded-2xl p-6 border-2 border-[#2a3441] hover:border-[#4a90e2] transition-all hover:scale-105"
                >
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-[#4a90e2] to-[#357abd]">
                    {philosopher.name.charAt(0)}
                  </div>
                  <h3 className="text-white font-bold text-center mb-1">
                    {philosopher.name}
                  </h3>
                  <p className="text-[#6c7a89] text-xs text-center">
                    {philosopher.period.split(' ')[0]}
                  </p>
                </button>
              ))}
            </div>
            )}

            {isGeneralMode && filteredPhilosophers.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setSelectedPhilosopher({ id: 'group', name: 'Philosophers', period: 'Multiple Perspectives', school: 'Various', keyThemes: [], styleGuide: '', color: '#4a90e2' } as Philosopher)}
                  className="px-8 py-3 bg-[#4a90e2] text-white rounded-xl font-bold hover:bg-[#357abd] transition-all"
                >
                  Start Group Discussion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="flex h-screen bg-[#0f1419]">
      {/* Sidebar */}
      <div className="w-72 bg-[#1a1f2e] border-r border-[#2a3441] flex flex-col">
        <div className="p-4 border-b border-[#2a3441]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Chat History</h2>
            <button
              onClick={startNewChat}
              className="text-[#6c7a89] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white text-sm placeholder-[#6c7a89] focus:outline-none focus:border-[#4a90e2]"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="text-[#6c7a89] text-xs font-semibold mb-2">Today</div>
            <button className="w-full text-left px-3 py-2 rounded-lg bg-[#2a3441] text-white text-sm hover:bg-[#3a4451] transition-colors mb-2">
              {isGeneralMode ? 'Group Discussion' : `Chat with ${selectedPhilosopher?.name}`}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[#2a3441]">
          <button 
            onClick={startNewChat}
            className="w-full px-4 py-2 bg-[#2a3441] text-white rounded-lg hover:bg-[#3a4451] transition-colors text-sm"
          >
            Delete Chat History
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-[#1a1f2e] border-b border-[#2a3441] p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={startNewChat}
              className="text-[#8b95a5] hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br from-[#4a90e2] to-[#357abd]">
              {isGeneralMode ? 'G' : selectedPhilosopher?.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-white font-bold">
                {isGeneralMode ? 'Philosopher Group' : selectedPhilosopher?.name}
              </h3>
              <p className="text-[#6c7a89] text-sm">
                {isGeneralMode ? 'Multiple perspectives' : selectedPhilosopher?.period}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-[#8b95a5] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 text-[#8b95a5] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold bg-gradient-to-br from-[#4a90e2] to-[#357abd]">
                  {isGeneralMode ? 'G' : selectedPhilosopher?.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isGeneralMode ? 'Philosopher Group Discussion' : selectedPhilosopher?.name}
                </h3>
                <p className="text-[#8b95a5] mb-6 max-w-md">
                  {isGeneralMode 
                    ? 'Ask a question to receive insights from multiple philosophical traditions'
                    : `I am ${selectedPhilosopher?.name}, ${selectedPhilosopher?.school}. Ask me about ${selectedPhilosopher?.keyThemes.slice(0, 2).join(', ')}, and more.`
                  }
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-3">
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-[#4a90e2] to-[#357abd]">
                    {isGeneralMode ? 'G' : philosophers.find(p => p.id === msg.philosopherId)?.name.charAt(0)}
                  </div>
                )}
                
                <div className={`flex-1 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                  {msg.role === 'user' ? (
                    <div className="max-w-[70%] bg-[#7c3aed] text-white rounded-2xl rounded-tr-sm px-4 py-3">
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : (
                    <div className="max-w-[85%]">
                      {msg.perspectives && msg.perspectives.length > 0 ? (
                        <div className="space-y-3">
                          {/* Overview Section */}
                          <div className="bg-[#1a1f2e] text-white rounded-2xl rounded-tl-sm px-5 py-4 border border-[#2a3441]">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-[#4a90e2]">Overview</h4>
                              {msg.themes && msg.themes.length > 0 && (
                                <div className="flex gap-1.5">
                                  {msg.themes.map((theme, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-[#2a3441] text-[#8b95a5] rounded-full text-xs">
                                      {theme}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-sm leading-relaxed text-[#d1d5db]">{msg.content}</p>
                          </div>

                          {/* Perspectives Section */}
                          <div className="space-y-2">
                            {msg.perspectives.map((persp, i) => {
                              const isExpanded = expandedPerspectives.has(`${msg.id}-${i}`);
                              const philosopher = philosophers.find(p => p.id === persp.philosopher);
                              
                              return (
                                <div 
                                  key={i} 
                                  className="bg-[#1a1f2e] text-white rounded-xl px-4 py-3 border-l-4 border border-[#2a3441] hover:border-[#3a4451] transition-colors" 
                                  style={{ borderLeftColor: philosopher?.color }}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                        style={{ background: `linear-gradient(135deg, ${philosopher?.color || '#4a90e2'}, #357abd)` }}
                                      >
                                        {persp.name?.charAt(0)}
                                      </div>
                                      <div>
                                        <span className="text-sm font-semibold text-white block">
                                          {persp.name}
                                        </span>
                                        <span className="text-xs text-[#6c7a89]">
                                          {persp.bio}
                                        </span>
                                      </div>
                                    </div>
                                    {persp.quote && (
                                      <button
                                        onClick={() => {
                                          const key = `${msg.id}-${i}`;
                                          setExpandedPerspectives(prev => {
                                            const newSet = new Set(prev);
                                            if (newSet.has(key)) {
                                              newSet.delete(key);
                                            } else {
                                              newSet.add(key);
                                            }
                                            return newSet;
                                          });
                                        }}
                                        className="text-[#4a90e2] hover:text-[#357abd] transition-colors"
                                      >
                                        <svg 
                                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                          fill="none" 
                                          stroke="currentColor" 
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm leading-relaxed text-[#d1d5db] mb-2">
                                    {persp.response}
                                  </p>

                                  {/* Expandable Quote Section */}
                                  {persp.quote && isExpanded && (
                                    <div className="mt-3 pt-3 border-t border-[#2a3441]">
                                      <p className="text-xs italic text-[#8b95a5] mb-2">
                                        "{persp.quote}"
                                      </p>
                                      {persp.source && (
                                        <div className="text-xs text-[#6c7a89]">
                                          {persp.source.chapter && (
                                            <span>{persp.source.chapter}</span>
                                          )}
                                          {persp.source.link && (
                                            <a 
                                              href={persp.source.link} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-[#4a90e2] hover:underline ml-2"
                                            >
                                              Read more →
                                            </a>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Recommendations Section */}
                          {msg.recommendations && msg.recommendations.length > 0 && (
                            <div className="bg-[#1a1f2e] text-white rounded-xl px-4 py-3 border border-[#2a3441]">
                              <h5 className="text-xs font-semibold text-[#8b95a5] mb-2 uppercase tracking-wide">
                                Explore More
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {msg.recommendations.slice(0, 5).map((recId, i) => {
                                  const recPhil = philosophers.find(p => p.id === recId);
                                  if (!recPhil) return null;
                                  return (
                                    <button
                                      key={i}
                                      onClick={() => {
                                        setSelectedPhilosopher(recPhil);
                                        setIsGeneralMode(false);
                                        setMessages([]);
                                      }}
                                      className="flex items-center space-x-1.5 bg-[#2a3441] hover:bg-[#3a4451] px-3 py-1.5 rounded-lg transition-colors text-xs"
                                    >
                                      <div 
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                        style={{ background: `linear-gradient(135deg, ${recPhil.color}, #357abd)` }}
                                      >
                                        {recPhil.name.charAt(0)}
                                      </div>
                                      <span className="text-white">{recPhil.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <span className="text-xs text-[#6c7a89] mt-2 block">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-[#1a1f2e] text-white rounded-2xl rounded-tl-sm px-4 py-3 border border-[#2a3441]">
                          <p className="text-sm leading-relaxed text-[#d1d5db]">{msg.content}</p>
                          <span className="text-xs text-[#6c7a89] mt-1 block">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-[#7c3aed] to-[#6d28d9]">
                    U
                  </div>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-[#4a90e2] to-[#357abd]">
                {isGeneralMode ? 'G' : selectedPhilosopher?.name.charAt(0)}
              </div>
              <div className="bg-[#1a1f2e] text-white rounded-2xl rounded-tl-sm px-4 py-3 border border-[#2a3441]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-[#4a90e2] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#4a90e2] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#4a90e2] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#1a1f2e] border-t border-[#2a3441] p-4">
          <div className="flex items-end space-x-3">
            <button className="p-2 text-[#8b95a5] hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            
            <div className="flex-1 bg-[#2a3441] rounded-2xl border border-[#3a4451] overflow-hidden">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${isGeneralMode ? 'the philosophers' : selectedPhilosopher?.name}...`}
                className="w-full px-4 py-3 bg-transparent text-white placeholder-[#6c7a89] focus:outline-none resize-none"
                rows={1}
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleAsk}
              disabled={!question.trim() || isLoading}
              className="p-3 bg-[#4a90e2] text-white rounded-xl hover:bg-[#357abd] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
