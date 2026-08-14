import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ResumeLens | AI Resume & Job Match Analyzer',
  description: 'Understand what your resume is saying to an ATS — and to a recruiter.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-slate-800">
            Resume<span className="text-blue-600">Lens</span>
          </div>
          <nav className="text-sm font-medium text-slate-500">
            Developer Portfolio Project
          </nav>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          <p>Built for demonstration purposes. Documents are processed in-memory and not permanently stored.</p>
        </footer>
      </body>
    </html>
  );
}
