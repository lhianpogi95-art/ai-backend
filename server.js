import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Firebase Admin (Firestore)
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  )
});

const db = admin.firestore();

// 🧠 Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/ask-ai", async (req, res) => {
  try {
    const { message, userId } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(message);
    const reply = result.response.text();

    // Save to Firestore
    await db.collection("aiChats").add({
      userId,
      message,
      reply,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI failed" });
  }
});

app.get("/", (req, res) => {
  res.send("SmartVet AI backend running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
