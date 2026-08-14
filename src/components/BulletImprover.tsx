"use client";

import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function BulletImprover() {
  const [bullet, setBullet] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ improved: string, why: string[] } | null>(null);
  const [error, setError] = useState('');

  const handleImprove = async () => {
    if (!bullet.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/improve-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        Bullet Point Improver
      </h3>
      <p className="text-sm text-slate-500 mb-4">Paste a single resume bullet point below to see an impact-driven rewrite without fabricated metrics.</p>
      
      <textarea
        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3 resize-none"
        rows={3}
        placeholder="e.g., Worked on the backend API using Node.js to make things faster."
        value={bullet}
        onChange={(e) => setBullet(e.target.value)}
      />
      
      <button
        onClick={handleImprove}
        disabled={loading || !bullet.trim()}
        className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Improve Bullet'}
      </button>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

      {result && (
        <div className="mt-5 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
          <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">Improved</p>
          <p className="text-sm font-medium text-slate-800 mb-4 flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
            {result.improved}
          </p>
          
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Why it's better</p>
            <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
              {result.why.map((reason, i) => <li key={i}>{reason}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
