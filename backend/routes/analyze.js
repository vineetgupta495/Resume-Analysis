const express = require("express");
const multer  = require("multer");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith(".pdf") || file.originalname.endsWith(".txt") ||
        file.mimetype === "application/pdf"  || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are supported."));
    }
  },
});

router.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const { jobPrompt } = req.body;
    if (!jobPrompt || !jobPrompt.trim()) return res.status(400).json({ error: "jobPrompt is required." });
    if (!req.file) return res.status(400).json({ error: "Resume file is required." });

    const isPdf = req.file.mimetype === "application/pdf" || req.file.originalname.toLowerCase().endsWith(".pdf");
    console.log(`[analyze] File: ${req.file.originalname} | Size: ${(req.file.size / 1024).toFixed(1)} KB`);

    const resume = isPdf
      ? { type: "pdf",  data: req.file.buffer.toString("base64") }
      : { type: "text", data: req.file.buffer.toString("utf-8")  };

    const { analyzeResume } = require("../services/lmStudioService");
    const result = await analyzeResume(jobPrompt, resume);
    return res.status(200).json(result);

  } catch (err) {
    console.error("[/api/analyze] ERROR:", err.message);
    return res.status(500).json({ error: err.message || "Analysis failed." });
  }
});

module.exports = router;
