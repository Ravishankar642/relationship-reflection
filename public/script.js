async function analyze() {
    const selects = document.querySelectorAll("select");
    const answers = [];

    for (let i = 0; i < selects.length; i++) {
        if (!selects[i].value) {
            alert("Please answer all questions.");
            return;
        }
        answers.push(`Q${i + 1}: ${selects[i].value}`);
    }

    const userName = localStorage.getItem("userName");
    const resultBox = document.getElementById("result");
    resultBox.textContent = "Analyzing…";

    const response = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, userName })
    });

    const data = await response.json();
    resultBox.textContent = data.result;
}
