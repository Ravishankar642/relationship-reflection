import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ===== ROUTES ===== */

// Health check (optional but useful)
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Analyze route (mock AI response for now)
app.post("/analyze", (req, res) => {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({
            result: "Invalid input. Please answer all questions."
        });
    }

    // Simple reflection logic (safe & friendly)
    const positiveCount = answers.filter(a =>
        a.includes("Agree")
    ).length;

    let result;

    if (positiveCount >= 4) {
        result =
            "Your responses suggest a generally healthy and supportive relationship. Communication, trust, and effort seem to be present. Like any relationship, there’s always room to grow — but you’re on solid ground.";
    } else if (positiveCount >= 2) {
        result =
            "Your responses show a mix of strengths and challenges. Some areas feel supportive, while others may need attention. Honest conversations and reflection could help bring more balance.";
    } else {
        result =
            "Your responses suggest there may be unresolved challenges in the relationship. This doesn’t mean failure — but it could be a sign that communication, trust, or emotional support need more care.";
    }

    res.json({ result });
});

/* ===== START SERVER ===== */
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
