import { GeminiAnalysisSchema } from '@/types';

export function calculateDeterministicScores(
  data: GeminiAnalysisSchema, 
  hasJobDescription: boolean
) {
  // 1. Structure Score (Max 20)
  let structureScore = 0;
  if (data.candidateInfo.hasSummary) structureScore += 4;
  if (data.candidateInfo.hasContactInfo) structureScore += 4;
  
  const expectedSections = ['education', 'experience', 'skills'];
  const foundSections = data.evidence.sectionsFound.map(s => s.toLowerCase());
  
  expectedSections.forEach(section => {
    if (foundSections.some(s => s.includes(section))) structureScore += 4;
  });

  // 2. Evidence & Impact Score (Max 25)
  let evidenceScore = 5; // Base score
  if (data.evidence.totalBullets > 0) {
    const quantifiedRatio = data.evidence.quantifiedBullets / data.evidence.totalBullets;
    evidenceScore += Math.min(20, Math.round(quantifiedRatio * 40)); // 50% quantified gets full points
    
    // Penalty for weak verbs
    const weakVerbPenalty = Math.min(10, data.evidence.weakActionVerbsCount * 2);
    evidenceScore = Math.max(0, evidenceScore - weakVerbPenalty);
  }

  // 3. ATS Readability Score (Max 10)
  let readabilityScore = 10;
  const issuesCount = data.evidence.formattingIssues.length;
  readabilityScore = Math.max(0, readabilityScore - (issuesCount * 3));

  // 4. Skills Coverage (Max 15 without JD, calculated from general extraction)
  // 5. Role Alignment (Max 30, only if JD provided)
  let skillsScore = 0;
  let roleAlignmentScore = 0;

  const totalSkills = data.skillsAnalysis.length;
  if (totalSkills === 0) {
    skillsScore = 0;
    roleAlignmentScore = 0;
  } else {
    const foundCount = data.skillsAnalysis.filter(s => s.status === 'FOUND').length;
    const partialCount = data.skillsAnalysis.filter(s => s.status === 'PARTIAL').length;
    
    // Base skills score based on raw presence
    const rawSkillScore = ((foundCount * 1) + (partialCount * 0.5)) / totalSkills;
    
    if (hasJobDescription) {
      skillsScore = Math.round(rawSkillScore * 15);
      roleAlignmentScore = Math.round(rawSkillScore * 30);
    } else {
      // Re-weight if no JD: Skills becomes worth 45 (15 + 30)
      skillsScore = Math.round(rawSkillScore * 45);
    }
  }

  const overall = structureScore + evidenceScore + readabilityScore + skillsScore + roleAlignmentScore;

  let interpretation = '';
  if (overall >= 85) interpretation = 'Strong presentation with clear, measurable impact.';
  else if (overall >= 70) interpretation = 'Solid foundation, but needs more quantifiable evidence.';
  else if (overall >= 50) interpretation = 'Missing critical structure or evidence. Needs significant revision.';
  else interpretation = 'Lacks basic resume components or readability. Start with formatting fundamentals.';

  return {
    overall: Math.min(100, Math.max(0, overall)),
    structure: structureScore,
    evidence: evidenceScore,
    skills: skillsScore,
    readability: readabilityScore,
    roleAlignment: hasJobDescription ? roleAlignmentScore : 0,
    interpretation
  };
}
