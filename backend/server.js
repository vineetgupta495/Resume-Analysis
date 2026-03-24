require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const analyzeRoute = require("./routes/analyze");

const app  = express();
const PORT = process.env.PORT || 4000;

// Allow all origins for Render deployment
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "*",
  methods: ["GET", "POST"],
}));

app.use(express.json());
app.use("/api", analyzeRoute);

app.get("/health", (req, res) => res.json({ status: "ok", model: "gemini" }));

app.listen(PORT, () => {
  console.log(`Resume Scorer API running on port ${PORT}`);
  console.log(`GEMINI_API_KEY loaded: ${process.env.GEMINI_API_KEY ? "YES ✓" : "NO ✗"}`);
});
