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
   ANALYSIS LOGIC
========================= */
function analyzeAnswers(answers = []) {
    let score = 0;

    answers.forEach(a => {
        const t = String(a).toLowerCase();
        if (t.includes("strongly agree")) score += 3;
        else if (t.includes("agree")) score += 2;
        else if (t.includes("disagree")) score -= 1;
    });

    if (score >= 5) return "High emotional balance detected.";
    if (score >= 2) return "Mixed emotional signals detected.";
    return "Emotional strain or imbalance detected.";
}

/* =========================
   SAVE ENDPOINT (ALL FLOWS)
========================= */
app.post("/save", async (req, res) => {
    try {
        const {
            sessionId,
            userName,
            relationshipStatus,
            flow,
            answers,
            result
        } = req.body;

        const payload = {
            session_id: sessionId || null,
            user_name: userName || null,
            relationship_status: relationshipStatus || null,
            flow: flow || null,
            answers: Array.isArray(answers) ? answers : null,
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
   RELATIONSHIP ANALYSIS
========================= */
app.post("/analyze", async (req, res) => {
    try {
        const {
            sessionId,
            userName,
            relationshipStatus,
            answers
        } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({ result: "Invalid answers." });
        }

        const reflection = analyzeAnswers(answers);

        /* 🔴 IMPORTANT FIX:
           SAVE DIRECTLY — NO FETCH */
        const { error } = await supabase
            .from("responses")
            .insert({
                session_id: sessionId || null,
                user_name: userName || null,
                relationship_status: relationshipStatus || "relationship",
                flow: "relationship",
                answers,
                result: reflection
            });

        if (error) {
            console.error("❌ SUPABASE ERROR:", error);
        } else {
            console.log("✅ RELATIONSHIP REFLECTION SAVED");
        }

        res.json({ result: reflection });

    } catch (err) {
        console.error("🔥 ANALYZE ERROR:", err);
        res.status(500).json({ result: "Server error." });
    }
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
