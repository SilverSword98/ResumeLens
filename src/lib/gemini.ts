import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiAnalysisSchema } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeResumeWithGemini(
  resumeText: string, 
  jobDescription?: string
): Promise<GeminiAnalysisSchema> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are an expert technical recruiter and ATS system analyzer.
    Analyze the following resume text. ${jobDescription ? `Compare it against the provided job description.` : `Evaluate its general strength and structure.`}
    
    CRITICAL RULES:
    1. Respond ONLY with valid JSON. No markdown formatting, no backticks.
    2. Extract actual evidence. Do not invent metrics or scores.
    3. If evaluating formatting, look for obvious parsing anomalies (e.g., repeating tabs, missing spaces, corrupted characters).
    
    JSON SCHEMA TO RETURN:
    {
      "candidateInfo": {
        "hasContactInfo": boolean, // true if email/phone found
        "hasSummary": boolean // true if professional summary/objective found
      },
      "evidence": {
        "totalBullets": number, // count of experience/project bullet points
        "quantifiedBullets": number, // count of bullets containing numbers, %, $, metrics
        "weakActionVerbsCount": number, // count of bullets starting with weak words like "Helped", "Worked on", "Responsible for"
        "formattingIssues": string[], // list of potential ATS issues (e.g., "Missing clear Experience header", "Irregular spacing indicating tables")
        "sectionsFound": string[] // e.g. ["Education", "Experience", "Skills"]
      },
      "skillsAnalysis": [
        // List up to 15 key skills ${jobDescription ? `extracted from the job description` : `extracted from the resume`}.
        // status MUST be "FOUND", "PARTIAL", or "MISSING".
        // evidenceContext is where it was found in the resume (e.g., "Experience - Company X" or null if MISSING)
        { "skill": "string", "status": "string", "evidenceContext": "string | null" }
      ],
      "strengths": [
        // 3 sentences highlighting what is working well.
      ],
      "improvements": [
        // Up to 4 specific, actionable improvements.
        // priority must be "High", "Medium", or "Low"
        {
          "priority": "string",
          "problem": "string",
          "why": "string",
          "action": "string"
        }
      ]
    }

    RESUME TEXT:
    ${resumeText}

    ${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ''}
  `;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1, // Keep it deterministic
      responseMimeType: "application/json"
    }
  });

  const responseText = result.response.text();
  try {
    return JSON.parse(responseText) as GeminiAnalysisSchema;
  } catch (e) {
    console.error("Failed to parse Gemini output:", responseText);
    throw new Error("AI returned malformed data structure.");
  }
}

export async function improveBulletPoint(bullet: string): Promise<{ original: string, improved: string, why: string[] }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are an expert resume writer. Improve the following resume bullet point.
    
    STRICT RULES:
    1. Do NOT invent metrics, percentages, revenue, users, or technologies.
    2. If the original lacks metrics, use placeholders exactly like this: "[X% improvement]" or "[number]".
    3. Start with a strong action verb.
    4. Focus on the impact and result.
    5. Respond ONLY with valid JSON.
    
    JSON SCHEMA:
    {
      "original": "${bullet}",
      "improved": "The rewritten bullet point",
      "why": ["Reason 1", "Reason 2"]
    }

    ORIGINAL BULLET:
    ${bullet}
  `;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
  });

  return JSON.parse(result.response.text());
}
