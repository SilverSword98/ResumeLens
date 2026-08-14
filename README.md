# ResumeLens - AI Resume & Job Match Analyzer

## Overview
ResumeLens is a deterministic resume analysis tool. Unlike generic ATS scoring platforms that output black-box numerical scores based on arbitrary AI sentiment, ResumeLens uses an explainable evidence-based scoring model. It extracts the raw document text, runs structured schema extraction via Gemini 1.5 Flash, and calculates a final score locally based on the presence of structural requirements, quantifiable impact, and role alignment.

This project was built to demonstrate practical skills in full-stack Next.js development, API integration, document processing, and structured NLP output.

## Problem
Many resume analyzers provide inflated or fabricated feedback, hallucinating metrics or providing scores that don't logically align with the document's content. Job seekers are often told to "add keywords" without context, leading to keyword stuffing without the necessary evidence. 

ResumeLens solves this by mapping *detected skills* to *detected evidence*. If a job requires "Python", ResumeLens doesn't just check if the word exists; it checks if it exists within the context of a project or job role, returning classifications of `FOUND`, `PARTIAL`, or `MISSING`.

## Features
- **PDF & DOCX Support**: Processes files server-side using native buffer parsing.
- **Role-Aware Matching**: Adjusts scoring weights and analyzes missing requirements if a Job Description is provided.
- **Deterministic Scoring Engine**: The AI is restricted to returning raw material facts (e.g., "Are there measurable impacts? Count them."). The application side executes the scoring algorithms.
- **Evidence-Based Recommendations**: Identifies exactly what is preventing a resume from being stronger, categorized by Priority (High/Medium/Low).
- **Bullet Point Improver**: An isolated tool that rewrites weak bullet points using strict prompt constraints to *prevent hallucinating metrics*. It uses placeholders (e.g., `[X% improvement]`) instead of inventing facts.

## Tech Stack
- **Framework**: Next.js 14+ (App Router), React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI / NLP**: Google Generative AI (`gemini-1.5-flash`)
- **Document Processing**: `pdf-parse`, `mammoth` (for DOCX)
- **Icons**: Lucide React

## Architecture & AI/NLP Approach
The core pipeline follows a strict separation of concerns:
1. **Extraction Pipeline**: `FormData` -> In-Memory `Buffer` -> Text Extraction (using Node environment APIs). 
2. **Schema-Constrained Generation**: The application prompts Gemini with a rigorous JSON Schema using `responseMimeType: "application/json"`. The LLM is instructed *not* to score the resume, but rather to extract facts (count of weak verbs, list of formatting anomalies, skill statuses).
3. **Local Scoring Calculation**: The Next.js API route takes the validated JSON schema and calculates scores out of 100 based on custom weighted logic (Structure 20%, Impact 25%, Alignment 30%, etc.).

## Limitations & Future Improvements
- **Document Parsing Edge Cases**: Highly complex multi-column PDFs might yield messy text structures. Currently mitigated by Gemini's contextual understanding, but a bounding-box OCR pipeline would improve layout analysis.
- **Memory Limits**: Files are processed in-memory. For massive scales, a streaming parser would be necessary.
- **Testing**: Includes basic component structures; future iterations should add robust Playwright E2E tests for the PDF upload flow.
