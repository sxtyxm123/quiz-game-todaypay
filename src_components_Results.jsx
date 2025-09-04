import React from "react";
import { Link } from "react-router-dom";

export default function Results({ questions, answers = {}, score = 0, restart }) {
  return (
    <div className="card">
      <h1>Results</h1>
      <p className="muted">You scored {score}/{questions.length}</p>

      <div className="results-list">
        {questions.map((q, idx) => {
          const selected = answers[q.id];
          const correct = q.correctIndex;
          const isCorrect = selected === correct;
          return (
            <div key={q.id} className="result-item">
              <div className="result-row">
                <strong>Q{idx + 1}.</strong>
                <div className="q-and-answers">
                  <div className="qtext small">{q.question}</div>
                  <div className="answer-row">
                    <div className={`chip ${isCorrect ? "chip-correct" : "chip-wrong"}`}>
                      {isCorrect ? "Correct" : "Incorrect"}
                    </div>
                    <div className="muted small">
                      Your answer: {selected == null ? "No answer" : q.options[selected]}
                    </div>
                    <div className="muted small">Correct: {q.options[correct]}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn" onClick={restart}>Restart Quiz</button>
        <Link to="/" className="btn btn-ghost">Home</Link>
      </div>
    </div>
  );
}