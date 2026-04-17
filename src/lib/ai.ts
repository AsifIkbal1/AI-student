import { ai, MODELS, generateQuiz, handleAIError, logUsage, generateTutorResponse, generateNotes, generateSlides, chatWithPDF, generateEssay, generateFlashcards, solveDoubt, summarizeVideo, helpWithCode, generateSmartStudyPackage, analyzeSkillGap, generateCareerRoadmap, generateStudyPlan } from "./gemini";

export { 
  generateQuiz, 
  handleAIError, 
  logUsage, 
  generateTutorResponse, 
  generateNotes, 
  generateSlides, 
  chatWithPDF, 
  generateEssay, 
  generateFlashcards, 
  solveDoubt, 
  summarizeVideo, 
  helpWithCode, 
  generateSmartStudyPackage, 
  analyzeSkillGap, 
  generateCareerRoadmap, 
  generateStudyPlan 
};

export async function analyzeEssay(essayText: string) {
  const systemPrompt = `You are an expert academic writing analyst. Analyze the given essay text and return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "plagiarismScore": 0,
  "aiScore": 0,
  "originalityScore": 0,
  "plagiarismDetails": "",
  "aiDetails": "",
  "suggestions": [
    { "original": "", "rewrite": "", "reason": "" }
  ]
}
Provide 3 to 5 rewrite suggestions targeting the most AI-sounding or suspicious sentences.`;

  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `${systemPrompt}\n\nAnalyze this essay:\n\n${essayText}`,
    config: {
        responseMimeType: "application/json",
    }
  });

  return { data: JSON.parse(response.text || "{}"), usage: response.usageMetadata };
}

export async function generateDiagramCode(input: string, type: string = 'mindmap', complexity: string = 'detailed') {
  const systemPrompt = `You are a Visual Learning Expert. Your goal is to convert the user's input into a valid Mermaid.js diagram.
  Requested Type: ${type}
  Complexity: ${complexity}
  
  Mermaid Syntax Rules:
  1. For 'mindmap', use 'mindmap' syntax.
  2. For 'flowchart', use 'graph TD' (Top Down) or 'graph LR' (Left Right).
  3. For 'diagram', use 'graph TD' with hierarchical clustering.
  
  General Rules:
  - Do NOT use code blocks (\`\`\`) or markdown.
  - Return ONLY the raw Mermaid syntax text.
  - Ensure labels with special characters are wrapped in quotes.
  - All nodes must have distinct IDs.
  - Hierarchically organize concepts based on complexity.`;

  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Analyze the following content and generate a Mermaid ${type}:\n\n${input}`,
    config: { systemInstruction: systemPrompt }
  });

  let cleanText = (response.text || "").trim();
  if (cleanText.startsWith("\`\`\`")) {
    cleanText = cleanText.replace(/^```(mermaid)?\n?/, "").replace(/\n?```$/, "");
  }

  return { text: cleanText, usage: response.usageMetadata };
}

export async function recommendResources(topic: string) {
  const systemPrompt = `You are a Resource Specialist AI. Find the best 3 research papers, 2 quality books, and 3 high-quality YouTube tutorials for the topic provided by the user.
  Return STRICTLY in JSON format:
  {
    "topic": "The Topic Title",
    "videos": [{"title": "Video Title", "url": "...", "reason": "..."}],
    "books": [{"title": "Book Title", "author": "...", "url": "...", "reason": "..."}],
    "papers": [{"title": "Paper Title", "url": "...", "reason": "..."}]
  }`;

  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Find best learning resources for the topic: ${topic}`,
    config: { systemInstruction: systemPrompt, responseMimeType: "application/json" }
  });

  return { data: JSON.parse(response.text || "{}"), usage: response.usageMetadata };
}
