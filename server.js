import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/*
  Helper: simple scoring + theme detection
*/
function analyzeAnswers(answers) {
    let score = 0;
    let themes = {
        communication: 0,
        support: 0,
        balance: 0,
        pain: false,
        fear: false
    };

    answers.forEach(a => {
        const text = a.toLowerCase();

        // MCQ scoring
        if (text.includes("strongly agree")) score += 3;
        else if (text.includes("agree")) score += 2;
        else if (text.includes("partially")) score += 1;
        else if (text.includes("disagree")) score -= 1;

        // Theme detection (typed answers)
        if (
            text.includes("talk") ||
            text.includes("communicat") ||
            text.includes("listen")
        ) {
            themes.communication++;
        }

        if (
            text.includes("support") ||
            text.includes("there for me") ||
            text.includes("alone")
        ) {
            themes.support++;
        }

        if (
            text.includes("effort") ||
            text.includes("one sided") ||
            text.includes("unbalanced")
        ) {
            themes.balance++;
        }

        if (
            text.includes("hurt") ||
            text.includes("pain") ||
            text.includes("ignored")
        ) {
            themes.pain = true;
        }

        if (
            text.includes("fear") ||
            text.includes("scared") ||
            text.includes("worried")
        ) {
            themes.fear = true;
        }
    });

    return { score, themes };
}

/*
  Generate reflection text based on analysis
*/
function generateReflection(score, themes) {
    // High score
    if (score >= 6) {
        return `
This relationship shows many signs of emotional stability and mutual effort.

You seem to feel supported and reasonably balanced overall. That doesn’t mean everything is perfect — but it does suggest that when problems arise, there is enough trust and communication to work through them.

The most important question for you now is not “Is this relationship okay?” but rather:
“How can we protect what is already working?”
`.trim();
    }

    // Medium score
    if (score >= 2) {
        return `
There is a mix of comfort and unresolved tension in this relationship.

Some needs appear to be met, while others remain unspoken or inconsistently addressed. This kind of middle ground is common — but it’s also where people slowly start feeling distant if nothing changes.

What matters most here is honesty:
Are you avoiding difficult conversations to keep the peace, or because you’re unsure they would be heard?
`.trim();
    }

    // Low score
    let extra = "";

    if (themes.pain) {
        extra +=
            "\n\nThere are signs of emotional pain that you may be carrying quietly. Ignoring this rarely makes it disappear.";
    }

    if (themes.fear) {
        extra +=
            "\n\nFear about the future is present here. That fear deserves clarity, not avoidance.";
    }

    return `
This relationship appears to be emotionally draining more often than fulfilling.

Several of your responses suggest imbalance, unmet needs, or feelings that are being suppressed rather than resolved. Over time, this can slowly erode self-worth and emotional safety.

The most important reflection here is this:
Are you staying because the relationship is growing — or because leaving feels harder than enduring?

${extra}
`.trim();
}

/*
  MAIN ANALYZE ENDPOINT
*/
app.post("/analyze", (req, res) => {
    try {
        const { answers, userName } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                result: "Invalid response data received."
            });
        }

        const { score, themes } = analyzeAnswers(answers);
        const reflection = generateReflection(score, themes);

        res.json({
            result: reflection
        });
    } catch (err) {
        console.error("ANALYZE ERROR:", err);
        res.status(500).json({
            result: "Something went wrong while analyzing your reflection."
        });
    }
});

/*
  SERVER
*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
