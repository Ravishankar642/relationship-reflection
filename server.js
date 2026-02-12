import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* =========================
   SUPABASE CLIENT
========================= */
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

/* =========================
   ANALYZE LOGIC
========================= */
function analyzeAnswers(answers) {
    let score = 0;

    answers.forEach(a => {
        const t = a.toLowerCase();
        if (t.includes("strongly agree")) score += 3;
        else if (t.includes("agree")) score += 2;
        else if (t.includes("partially")) score += 1;
        else if (t.includes("disagree")) score -= 1;
    });

    if (score >= 6) return "high";
    if (score >= 2) return "medium";
    return "low";
}

function generateReflection(level) {
    if (level === "high") {
        return `This reflection suggests emotional balance and mutual effort.
The relationship appears stable, though continued communication will matter.`;
    }

    if (level === "medium") {
        return `This reflection shows a mix of comfort and unresolved tension.
Some needs may be unmet or unspoken. Honest conversation is important here.`;
    }

    return `This reflection suggests emotional strain or imbalance.
Staying without change may slowly affect your emotional well-being.`;
}

/* =========================
   MAIN ENDPOINT
========================= */
app.post("/analyze", async (req, res) => {
    try {
        const {
            answers,
            userName,
            relationshipStatus
        } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ result: "Invalid input." });
        }

        const level = analyzeAnswers(answers);
        const reflection = generateReflection(level);

        /* =========================
           SAVE TO SUPABASE
        ========================= */
        const { error } = await supabase
            .from("responses")
            .insert({
                user_name: userName || null,
                relationship_status: relationshipStatus || null,
                answers,
                result: reflection
            });

        if (error) {
            console.error("SUPABASE INSERT ERROR:", error);
        } else {
            console.log("✅ Response saved to Supabase");
        }

        res.json({ result: reflection });
    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.status(500).json({
            result: "Server error while analyzing reflection."
        });
    }
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
