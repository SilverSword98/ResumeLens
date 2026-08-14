"use client";

import { useState } from 'react';
import { Upload, FileText, Briefcase, AlertCircle, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import { FinalAnalysisResult } from '@/types';
import BulletImprover from '@/components/BulletImprover';
import clsx from 'clsx';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<FinalAnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
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

  const reset = () => {
    setResult(null);
    setFile(null);
    setJobDescription('');
  };

  if (result) {
    return (
      <div className="max-w-6xl mx-auto w-full p-6 md:p-12 animate-in fade-in duration-500">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Analysis Results</h1>
            <p className="text-slate-500 text-sm">
              Analyzed {file?.name} {result.hasJobDescription ? 'against target role' : 'for general best practices'}.
            </p>
          </div>
          <button 
            onClick={reset}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-lg transition-colors"
          >
            Analyze another
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Scores & Core Metrics */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Overall Readiness</h2>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                  <circle 
                    className={clsx(
                      result.scores.overall >= 75 ? "text-green-500" : result.scores.overall >= 50 ? "text-amber-500" : "text-red-500",
                      "transition-all duration-1000 ease-out"
                    )}
                    strokeWidth="8" 
                    strokeDasharray={364} 
                    strokeDashoffset={364 - (364 * result.scores.overall) / 100} 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="58" cx="64" cy="64" 
                  />
                </svg>
                <span className="absolute text-3xl font-bold">{result.scores.overall}</span>
              </div>
              <p className="mt-4 text-sm font-medium text-slate-700">{result.interpretation}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4 border-b border-slate-100 pb-2">Score Breakdown</h3>
              <div className="space-y-4">
                <ScoreBar label="Resume Structure" score={result.scores.structure} max={20} />
                <ScoreBar label="Evidence & Impact" score={result.scores.evidence} max={25} />
                <ScoreBar label="ATS Readability" score={result.scores.readability} max={10} />
                <ScoreBar label={result.hasJobDescription ? "Role Alignment" : "Skills Coverage (Re-weighted)"} score={result.hasJobDescription ? result.scores.roleAlignment : result.scores.skills} max={result.hasJobDescription ? 30 : 45} />
                {result.hasJobDescription && <ScoreBar label="Skills Coverage" score={result.scores.skills} max={15} />}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" /> What's Working
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {result.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                    {str}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Recommendations, Skills, Bullet Tools */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Actionable Recommendations */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Recommended Actions</h3>
              <div className="space-y-4">
                {result.improvements.map((rec, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="shrink-0 pt-1">
                      {rec.priority === 'High' ? <AlertCircle className="w-5 h-5 text-red-500" /> : 
                       rec.priority === 'Medium' ? <AlertCircle className="w-5 h-5 text-amber-500" /> : 
                       <AlertCircle className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 mb-1">
                        <span className={clsx(
                          "text-xs uppercase tracking-wider font-bold mr-2",
                          rec.priority === 'High' ? "text-red-600" : rec.priority === 'Medium' ? "text-amber-600" : "text-blue-600"
                        )}>{rec.priority} PRIORITY</span>
                        {rec.problem}
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">{rec.why}</p>
                      <div className="inline-block px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700">
                        <span className="text-slate-400 mr-2">Action:</span> {rec.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">
                {result.hasJobDescription ? "Role Match Breakdown" : "Detected Skills Profile"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.skillsAnalysis.map((skill, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg text-sm bg-slate-50">
                    <div>
                      <span className="font-medium text-slate-800 block">{skill.skill}</span>
                      <span className="text-xs text-slate-500">
                        {skill.evidenceContext || 'No evidence found'}
                      </span>
                    </div>
                    <div>
                      {skill.status === 'FOUND' && <span className="flex items-center text-xs font-bold text-green-600"><CheckCircle2 className="w-4 h-4 mr-1"/> FOUND</span>}
                      {skill.status === 'PARTIAL' && <span className="flex items-center text-xs font-bold text-amber-600"><AlertCircle className="w-4 h-4 mr-1"/> PARTIAL</span>}
                      {skill.status === 'MISSING' && <span className="flex items-center text-xs font-bold text-red-600"><XCircle className="w-4 h-4 mr-1"/> MISSING</span>}
                    </div>
                  </div>
                ))}
              </div>
              {result.hasJobDescription && result.skillsAnalysis.some(s => s.status === 'MISSING') && (
                <p className="mt-4 text-xs text-slate-500">
                  <span className="font-semibold">Note:</span> Only add missing skills if you genuinely have the experience. Otherwise, consider gaining exposure to these technologies.
                </p>
              )}
            </div>

            <BulletImprover />

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-12 md:py-24">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Understand what your resume is saying.
        </h1>
        <p className="text-lg text-slate-600 mb-2">
          An explainable, deterministic analysis tool that shows exactly what's preventing your resume from being stronger.
        </p>
        <p className="text-xs text-slate-400 font-medium">
          Scores are estimates based on structural evidence. They are not predictions of hiring outcomes.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">1. Upload Resume (PDF or DOCX)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
              <input 
                type="file" 
                accept=".pdf,.docx" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="flex flex-col items-center pointer-events-none">
                <FileText className="w-10 h-10 text-slate-400 mb-3" />
                {file ? (
                  <span className="text-sm font-medium text-blue-600">{file.name}</span>
                ) : (
                  <>
                    <span className="text-sm font-medium text-slate-700">Click to upload or drag and drop</span>
                    <span className="text-xs text-slate-500 mt-1">PDF or DOCX up to 5MB</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Job Description (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1 flex items-center justify-between">
              <span>2. Target Job Description</span>
              <span className="text-xs text-slate-400 font-normal bg-slate-100 px-2 py-0.5 rounded">Optional</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">Paste the job description to enable role-aware matching and missing keyword detection.</p>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={5}
              placeholder="Paste responsibilities and requirements here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-4 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

        </div>
        
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-end">
          <button
            type="submit"
            disabled={!file || loading}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Document...</>
            ) : (
              'Analyze My Resume'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function ScoreBar({ label, score, max }: { label: string, score: number, max: number }) {
  const percentage = Math.min(100, Math.max(0, (score / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{score} / {max}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-slate-800 h-2 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
