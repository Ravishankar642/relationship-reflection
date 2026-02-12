function submitSingle() {
    const selects = document.querySelectorAll("select");
    const textareas = document.querySelectorAll("textarea");
    const answers = [];

    for (let i = 0; i < selects.length; i++) {
        if (!selects[i].value) {
            alert("Please answer all multiple-choice questions.");
            return;
        }
        answers.push(`MCQ ${i + 1}: ${selects[i].value}`);
    }

    for (let i = 0; i < textareas.length; i++) {
        const value = textareas[i].value.trim();
        if (!value) {
            alert("Please answer all reflection questions.");
            return;
        }
        answers.push(`Reflection ${i + 1}: ${value}`);
    }

    localStorage.setItem("reflectionAnswers", JSON.stringify(answers));
    localStorage.setItem("relationshipStatus", "single");

    window.location.href = "result.html";
}
