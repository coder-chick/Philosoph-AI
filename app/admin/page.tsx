'use client';

import { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, Timestamp, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useRouter } from 'next/navigation';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AnalyticsData {
  totalQuestions: number;
  questionsToday: number;
  avgSessionLength: number;
  ragUsagePercent: number;
  topPhilosopher: string;
  errorRate: number;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  philosopherId: string;
  timestamp: string;
  hasRagContext: boolean;
  mode: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [philosopherData, setPhilosopherData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = firebaseAuth?.onAuthStateChanged((user) => {
      if (user) {
        // Check if user is admin
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'your_email@example.com';
        if (user.email === adminEmail) {
          setIsAuthenticated(true);
          loadAnalytics();
        } else {
          setError('Unauthorized access');
          handleSignOut();
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe?.();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!firebaseAuth) throw new Error('Firebase auth not initialized');
      
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      
      // Get ID token and create session
      const idToken = await user.getIdToken();
      
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
  };

  const handleSignOut = async () => {
    try {
      if (firebaseAuth) {
        await signOut(firebaseAuth);
      }
      await fetch('/api/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const loadAnalytics = async () => {
    if (!db) return;

    try {
      // Get total questions
      const questionsRef = collection(db, 'questions');
      const totalSnapshot = await getCountFromServer(questionsRef);
      const totalQuestions = totalSnapshot.data().count;

      // Get questions today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayQuery = query(
        questionsRef,
        where('timestamp', '>=', today.toISOString())
      );
      const todaySnapshot = await getCountFromServer(todayQuery);
      const questionsToday = todaySnapshot.data().count;

      // Get recent questions
      const recentQuery = query(
        questionsRef,
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const questions = recentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Question));

      setRecentQuestions(questions);

      // Calculate analytics
      const philosopherCounts: Record<string, number> = {};
      let ragCount = 0;
      
      questions.forEach(q => {
        philosopherCounts[q.philosopherId] = (philosopherCounts[q.philosopherId] || 0) + 1;
        if (q.hasRagContext) ragCount++;
      });

      const topPhilosopher = Object.entries(philosopherCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none';

      const ragUsagePercent = questions.length > 0 
        ? Math.round((ragCount / questions.length) * 100) 
        : 0;

      // Get sessions for avg length
      const sessionsRef = collection(db, 'sessions');
      const sessionsSnapshot = await getDocs(sessionsRef);
      const avgSessionLength = sessionsSnapshot.docs.length > 0
        ? Math.round(sessionsSnapshot.docs.reduce((sum, doc) => 
            sum + (doc.data().questionCount || 0), 0) / sessionsSnapshot.docs.length)
        : 0;

      setAnalytics({
        totalQuestions,
        questionsToday,
        avgSessionLength,
        ragUsagePercent,
        topPhilosopher,
        errorRate: 0,
      });

      // Prepare chart data
      setPhilosopherData({
        labels: Object.keys(philosopherCounts),
        datasets: [{
          label: 'Questions per Philosopher',
          data: Object.values(philosopherCounts),
          backgroundColor: [
            '#8B4513', '#4169E1', '#228B22', '#FF6347',
            '#800020', '#8B0000', '#FFD700', '#2E8B57'
          ],
        }]
      });

      // Daily data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      }).reverse();

      const dailyCounts = await Promise.all(
        last7Days.map(async (date) => {
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          
          const dayQuery = query(
            questionsRef,
            where('timestamp', '>=', date.toISOString()),
            where('timestamp', '<', nextDay.toISOString())
          );
          const daySnapshot = await getCountFromServer(dayQuery);
          return daySnapshot.data().count;
        })
      );

      setDailyData({
        labels: last7Days.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Questions per Day',
          data: dailyCounts,
          backgroundColor: '#0ea5e9',
        }]
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">
            Admin Dashboard
          </h1>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-600">Philosoph-AI Analytics</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Total Questions</h3>
            <p className="text-3xl font-bold text-slate-900">{analytics?.totalQuestions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Questions Today</h3>
            <p className="text-3xl font-bold text-primary-600">{analytics?.questionsToday || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Avg Session Length</h3>
            <p className="text-3xl font-bold text-slate-900">{analytics?.avgSessionLength || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">RAG Usage</h3>
            <p className="text-3xl font-bold text-green-600">{analytics?.ragUsagePercent || 0}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {dailyData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Questions per Day</h3>
              <Bar data={dailyData} />
            </div>
          )}
          {philosopherData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Philosophers</h3>
              <Pie data={philosopherData} />
            </div>
          )}
        </div>

        {/* Recent Questions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Recent Questions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Philosopher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    RAG
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recentQuestions.map((q) => (
                  <tr key={q.id}>
                    <td className="px-6 py-4 text-sm text-slate-900 max-w-md truncate">
                      {q.question}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {q.philosopherId}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(q.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {q.hasRagContext ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
