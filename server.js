import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("SmartVet AI backend running");
});

app.post("/ask-ai", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: "AI failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
