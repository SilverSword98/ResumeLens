import { NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/parsers';
import { analyzeResumeWithGemini } from '@/lib/gemini';
import { calculateDeterministicScores } from '@/lib/scoring';
import { FinalAnalysisResult } from '@/types';

// Ensure Node runtime for file parsing (pdf-parse relies on standard Node APIs)
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume') as File | null;
    const jobDescription = formData.get('jobDescription') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No resume file provided.' }, { status: 400 });
    }

    // 1. Extract Text
    const resumeText = await extractTextFromFile(file);
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract sufficient text from the document.' }, { status: 400 });
    }

    const hasJD = !!(jobDescription && jobDescription.trim().length > 0);

    // 2. AI Analysis
    const rawAnalysis = await analyzeResumeWithGemini(resumeText, hasJD ? jobDescription : undefined);

    // 3. Deterministic Scoring
    const scores = calculateDeterministicScores(rawAnalysis, hasJD);

    // 4. Construct Final Result
    const finalResult: FinalAnalysisResult = {
      ...rawAnalysis,
      scores,
      interpretation: scores.interpretation,
      hasJobDescription: hasJD
    };

    return NextResponse.json(finalResult);
  } catch (error: any) {
    console.error('Analysis API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during analysis.' },
      { status: 500 }
    );
  }
}
