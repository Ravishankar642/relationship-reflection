import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* =========================
   SUPABASE
========================= */
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

/* =========================
   SAVE EVERYTHING
========================= */
app.post("/save", async (req, res) => {
    try {
        const {
            userName,
            relationshipStatus,
            flow,
            answers,
            result
        } = req.body;

        const payload = {
            user_name: userName || null,
            relationship_status: relationshipStatus || null,
            flow: flow || null,
            answers: answers || null,
            result: result || null
        };

        console.log("📤 SAVING:", payload);

        const { error } = await supabase
            .from("responses")
            .insert(payload);

        if (error) {
            console.error("❌ SUPABASE ERROR:", error);
            return res.status(500).json({ ok: false });
        }

        console.log("✅ SAVED TO SUPABASE");
        res.json({ ok: true });

    } catch (err) {
        console.error("🔥 SERVER ERROR:", err);
        res.status(500).json({ ok: false });
    }
});

/* =========================
   ANALYZE (RELATIONSHIP)
========================= */
function analyzeAnswers(answers) {
    let score = 0;
    answers.forEach(a => {
        const t = a.toLowerCase();
        if (t.includes("agree")) score += 2;
        if (t.includes("disagree")) score -= 1;
    });
    return score >= 3
        ? "High balance and emotional stability detected."
        : "Some emotional gaps or unresolved tension detected.";
}

app.post("/analyze", async (req, res) => {
    const { answers, userName, relationshipStatus } = req.body;

    const reflection = analyzeAnswers(answers || []);

    // SAVE RELATIONSHIP RESULT
    await fetch("http://localhost:3000/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userName,
            relationshipStatus,
            flow: "relationship",
            answers,
            result: reflection
        })
    });

    res.json({ result: reflection });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
