const { SYSTEM_PROMPT } = require("../config/systemPrompt");

// Models tried in order if quota is exceeded
const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

async function analyzeResume(jobPrompt, resume) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");

  let resumeText = null;

  // Try PDF inline first with each model
  if (resume.type === "pdf") {
    for (const model of MODELS) {
      try {
        console.log(`[gemini] Trying PDF inline with ${model}...`);
        const result = await callGemini(apiKey, model, buildPdfBody(jobPrompt, resume.data));
        console.log(`[gemini] Success with ${model}`);
        return result;
      } catch (err) {
        if (err.message.includes("429")) {
          console.warn(`[gemini] ${model} quota exceeded, trying next model...`);
          continue;
        }
        // Not a quota error — fall through to text extraction
        console.warn(`[gemini] PDF inline failed with ${model}: ${err.message}`);
        break;
      }
    }

    // Extract text as fallback
    try {
      const pdfParse = require("pdf-parse");
      const buffer   = Buffer.from(resume.data, "base64");
      const parsed   = await pdfParse(buffer);
      resumeText     = parsed.text?.trim();
      if (!resumeText || resumeText.length < 50) {
        throw new Error("PDF appears to be scanned/image-based and could not be read.");
      }
      console.log(`[gemini] Extracted ${resumeText.length} chars from PDF.`);
    } catch (err) {
      throw new Error(`Could not extract PDF text: ${err.message}`);
    }
  } else {
    resumeText = resume.data;
  }

  // Try text mode with each model
  for (const model of MODELS) {
    try {
      console.log(`[gemini] Trying text mode with ${model}...`);
      const result = await callGemini(apiKey, model, buildTextBody(jobPrompt, resumeText));
      console.log(`[gemini] Success with ${model}`);
      return result;
    } catch (err) {
      if (err.message.includes("429")) {
        console.warn(`[gemini] ${model} quota exceeded, trying next model...`);
        continue;
      }
      throw new Error(`Could not process PDF: ${err.message}`);
    }
  }

  throw new Error("All Gemini models have exceeded their quota. Please wait until tomorrow or create a new API key at https://aistudio.google.com/app/apikey");
}

function buildPdfBody(jobPrompt, base64Data) {
  return {
    contents: [{
      role: "user",
      parts: [
        { inline_data: { mime_type: "application/pdf", data: base64Data } },
        { text: `${SYSTEM_PROMPT}\n\n---\n\nJob Requirement: ${jobPrompt}\n\nAnalyze the attached resume and respond with JSON only.` },
      ],
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
  };
}

function buildTextBody(jobPrompt, text) {
  return {
    contents: [{
      role: "user",
      parts: [{
        text: `${SYSTEM_PROMPT}\n\n---\n\nJob Requirement: ${jobPrompt}\n\nResume Content:\n${text}\n\nRespond with JSON only.`,
      }],
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
  };
}

async function callGemini(apiKey, model, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(`${url}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data    = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();

  if (!rawText) throw new Error("Empty response from Gemini.");

  let cleanText = rawText.replace(/```json|```/g, "").trim();

  // Extract JSON object even if model adds extra text
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleanText = jsonMatch[0];

  try {
    return JSON.parse(cleanText);
  } catch {
    throw new Error(`Failed to parse Gemini response as JSON. Raw: ${cleanText.slice(0, 200)}`);
  }
}

module.exports = { analyzeResume };
