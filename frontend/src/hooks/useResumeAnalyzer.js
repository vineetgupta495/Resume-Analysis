import { useState, useCallback } from "react";
import { analyzeResume } from "../utils/api";

/**
 * Custom hook that encapsulates all resume-analysis state and logic.
 * Components stay pure UI — no API knowledge needed.
 */
export function useResumeAnalyzer() {
  const [jobPrompt, setJobPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback((f) => {
    if (!f) return;
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(f.type)) {
      setError("Only PDF and TXT files are supported.");
      return;
    }
    setFile(f);
    setError("");
  }, []);

  const analyze = useCallback(async () => {
    if (!jobPrompt.trim()) return setError("Please enter a job requirement.");
    if (!file) return setError("Please upload a resume.");

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeResume(file, jobPrompt);
      setResult(data);
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [jobPrompt, file]);

  const reset = useCallback(() => {
    setJobPrompt("");
    setFile(null);
    setResult(null);
    setError("");
  }, []);

  return {
    jobPrompt, setJobPrompt,
    file, handleFile,
    result,
    loading,
    error,
    analyze,
    reset,
  };
}
