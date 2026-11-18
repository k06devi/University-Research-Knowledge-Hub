import express from "express";
import cors from "cors";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const dataPath = fileURLToPath(new URL("./data/knowledge.json", import.meta.url));
const knowledge = JSON.parse(fs.readFileSync(dataPath, "utf8"));
import { answerQuestion, searchKnowledge, getStats } from "./src/engine.js";

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.CLIENT_ORIGIN || "*";

app.use(cors({ origin: allowedOrigin === "*" ? true : allowedOrigin.split(",").map(x => x.trim()) }));
app.use(express.json());

app.get("/", (_req, res) => res.json({
  name: "University Research Knowledge Hub API",
  status: "running",
  endpoints: ["/api/health", "/api/knowledge", "/api/search?q=AI", "/api/query"]
}));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/knowledge", (_req, res) => res.json(knowledge));
app.get("/api/stats", (_req, res) => res.json(getStats(knowledge)));
app.get("/api/search", (req, res) => {
  const q = String(req.query.q || "").trim();
  res.json({ query: q, results: searchKnowledge(knowledge, q) });
});
app.post("/api/query", (req, res) => {
  const question = String(req.body.question || "").trim();
  if (!question) return res.status(400).json({ error: "Please enter a question." });
  res.json(answerQuestion(knowledge, question));
});
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, () => console.log(`Knowledge Hub API running on port ${PORT}`));
