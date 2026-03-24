import { useState, useCallback } from "react";

export function useCompareResumes() {
  const [jobPrompt, setJobPrompt] = useState("");
  const [files, setFiles]         = useState([]);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [progress, setProgress]   = useState({ current: 0, total: 0, name: "" });

  const addFiles = useCallback((newFiles) => {
    const allowed = ["application/pdf", "text/plain"];
    const valid   = Array.from(newFiles).filter(
      (f) => allowed.includes(f.type) || f.name.endsWith(".pdf") || f.name.endsWith(".txt")
    );
    if (valid.length === 0) { setError("Only PDF and TXT files are supported."); return; }
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !existing.has(f.name))];
    });
    setError("");
  }, []);

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const analyzeAll = useCallback(async () => {
    if (!jobPrompt.trim()) return setError("Please enter a job requirement.");
    if (files.length < 2)  return setError("Please upload at least 2 resumes to compare.");

    setLoading(true);
    setError("");
    setResults([]);
    setProgress({ current: 0, total: files.length, name: "" });

    const allResults = [];

    // Process ONE AT A TIME — local LLM can't handle parallel requests
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length, name: file.name });

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("jobPrompt", jobPrompt);

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}/api/analyze`,
          { method: "POST", body: formData }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Failed to analyze ${file.name}`);
        }

        const data = await res.json();
        allResults.push({ name: file.name, ...data });
        console.log(`[compare] ✓ ${file.name} → score: ${data.score}`);

      } catch (err) {
        console.error(`[compare] ✗ ${file.name}:`, err.message);
        // Don't stop — push a failed placeholder so user sees which one failed
        allResults.push({
          name: file.name,
          score: 0,
          verdict: "Not Recommended",
          summary: `Analysis failed: ${err.message}`,
          strengths: [],
          gaps: ["Could not process this resume"],
          skillBreakdown: { technicalSkills: 0, experience: 0, education: 0, projectRelevance: 0 },
          recommendation: "Please retry this resume individually.",
          failed: true,
        });
      }
    }

    // Sort by score descending
    allResults.sort((a, b) => b.score - a.score);
    setResults(allResults);
    setProgress({ current: 0, total: 0, name: "" });
    setLoading(false);
  }, [jobPrompt, files]);

  const reset = useCallback(() => {
    setJobPrompt("");
    setFiles([]);
    setResults([]);
    setError("");
    setProgress({ current: 0, total: 0, name: "" });
  }, []);

  return {
    jobPrompt, setJobPrompt,
    files, addFiles, removeFile,
    results, loading, error, progress,
    analyzeAll, reset,
  };
}
