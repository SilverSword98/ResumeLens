export interface AnalysisRequest {
  resumeText: string;
  jobDescription?: string;
}

export type SkillStatus = 'FOUND' | 'PARTIAL' | 'MISSING';

export interface SkillMatch {
  skill: string;
  status: SkillStatus;
  evidenceContext: string | null;
}

export interface ImprovementRecommendation {
  priority: 'High' | 'Medium' | 'Low';
  problem: string;
  why: string;
  action: string;
}

// The raw structured JSON returned by Gemini
export interface GeminiAnalysisSchema {
  candidateInfo: {
    hasContactInfo: boolean;
    hasSummary: boolean;
  };
  evidence: {
    totalBullets: number;
    quantifiedBullets: number;
    weakActionVerbsCount: number;
    formattingIssues: string[];
    sectionsFound: string[];
  };
  skillsAnalysis: SkillMatch[];
  strengths: string[];
  improvements: ImprovementRecommendation[];
}

// The final calculated output sent to the frontend
export interface FinalAnalysisResult extends GeminiAnalysisSchema {
  scores: {
    overall: number;
    structure: number;
    evidence: number;
    skills: number;
    readability: number;
    roleAlignment: number; // 0 if no JD provided
  };
  interpretation: string;
  hasJobDescription: boolean;
}
