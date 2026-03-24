const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function analyzeResume(file, jobPrompt) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("jobPrompt", jobPrompt);

  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Analysis failed. Please try again.");
  }

  return res.json();
}
