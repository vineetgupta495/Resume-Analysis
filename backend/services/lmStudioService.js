const { SYSTEM_PROMPT } = require("../config/systemPrompt");

const LM_STUDIO_URL   = process.env.LM_STUDIO_URL || "http://127.0.0.1:1234/v1/chat/completions";
const MAX_RESUME_CHARS = 2500; // reduced from 5000 — enough for scoring, much faster

async function analyzeResume(jobPrompt, resume) {
  let resumeText = "";

  if (resume.type === "pdf") {
    try {
      const pdfParse = require("pdf-parse");
      const buffer   = Buffer.from(resume.data, "base64");
      const parsed   = await pdfParse(buffer);
      resumeText     = parsed.text?.trim();

      if (!resumeText || resumeText.length < 50) {
        throw new Error("PDF appears to be scanned/image-based and could not be read.");
      }
      console.log(`[lmstudio] Extracted ${resumeText.length} chars from PDF.`);
    } catch (err) {
      throw new Error(`Could not extract text from PDF: ${err.message}`);
    }
  } else {
    resumeText = resume.data;
  }

  // Truncate to keep prompt short = faster response
  if (resumeText.length > MAX_RESUME_CHARS) {
    console.warn(`[lmstudio] Truncating resume from ${resumeText.length} to ${MAX_RESUME_CHARS} chars for speed.`);
    resumeText = resumeText.slice(0, MAX_RESUME_CHARS);
  }

  // Shorter, tighter prompt = fewer tokens = faster
  const fullPrompt = `${SYSTEM_PROMPT}

Job Requirement: ${jobPrompt}

Resume:
${resumeText}

JSON only:`;

  console.log(`[lmstudio] Sending request (${resumeText.length} chars)...`);
  return callGemma(fullPrompt);
}

async function callGemma(prompt) {
  try {
    const response = await fetch(LM_STUDIO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemma-3-1b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 600,   // reduced — JSON response needs ~400 tokens max
        stream: false,
        response_format: { type: "json_object" },
      }),
    });

    if (response.status === 400) {
      const errText = await response.text();
      if (errText.includes("Context size")) throw new Error("Context size exceeded.");
      return callGemmaPlain(prompt);
    }

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`LM Studio error ${response.status}: ${err}`);
    }

    return parseResponse(await response.json());

  } catch (err) {
    if (err.message.includes("json_object") || err.message.includes("JSON mode")) {
      return callGemmaPlain(prompt);
    }
    throw err;
  }
}

async function callGemmaPlain(prompt) {
  const response = await fetch(LM_STUDIO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemma-3-1b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 600,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LM Studio error ${response.status}: ${err}`);
  }

  return parseResponse(await response.json());
}

function parseResponse(data) {
  const rawText = data?.choices?.[0]?.message?.content?.trim();
  if (!rawText) throw new Error("Empty response from LM Studio.");

  console.log("[lmstudio] Response received, parsing JSON...");

  let cleanText = rawText.replace(/```json|```/g, "").trim();
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleanText = jsonMatch[0];

  try {
    const parsed = JSON.parse(cleanText);
    return validateResult(parsed);
  } catch {
    throw new Error(`Failed to parse response as JSON. Raw: ${cleanText.slice(0, 300)}`);
  }
}

function validateResult(result) {
  const defaults = {
    score: 5.0,
    verdict: "Borderline",
    summary: "Analysis completed.",
    strengths: ["Experience in relevant domain"],
    gaps: ["Further evaluation needed"],
    skillBreakdown: { technicalSkills: 5, experience: 5, education: 5, projectRelevance: 5 },
    recommendation: "Review the candidate profile and consider scheduling an interview to better assess their fit.",
  };

  for (const key of Object.keys(defaults)) {
    if (result[key] === undefined || result[key] === null || result[key] === "") {
      console.warn(`[lmstudio] Missing field "${key}" — using default.`);
      result[key] = defaults[key];
    }
  }

  if (typeof result.recommendation === "string" && result.recommendation.trim().length < 5) {
    result.recommendation = defaults.recommendation;
  }
  if (!Array.isArray(result.strengths) || result.strengths.length === 0) result.strengths = defaults.strengths;
  if (!Array.isArray(result.gaps)      || result.gaps.length === 0)      result.gaps      = defaults.gaps;

  return result;
}

module.exports = { analyzeResume };
