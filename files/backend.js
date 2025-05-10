const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const GEMINI_API_KEY = "your_gemini_api_key";
const HUGGING_FACE_API_KEY = "your_hugging_face_api_key";

app.post("/planning", async (req, res) => {
  const { appName, appDescription } = req.body;
  const response = await fetch("https://gemini-api-url.com", {
    method: "POST",
    headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ appName, appDescription }),
  });
  const data = await response.json();
  res.json({ tasks: data.tasks });
});

app.post("/coding", async (req, res) => {
  const { tasks } = req.body;
  const response = await fetch("https://huggingface-api-url.com", {
    method: "POST",
    headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ tasks }),
  });
  const data = await response.json();
  res.json({ code: data.code });
});

app.post("/reviewing", async (req, res) => {
  const { code } = req.body;
  const response = await fetch("https://huggingface-api-url.com", {
    method: "POST",
    headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const data = await response.json();
  res.json({ suggestions: data.suggestions });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));