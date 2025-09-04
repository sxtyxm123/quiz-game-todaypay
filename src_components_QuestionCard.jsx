import React, { useEffect, useState } from "react";

/*
Props:
- question: { id, question, options: [], correctIndex }
- index, total
- selectedIndex
- locked (boolean)
- onSelect(questionId, selectedIndex)
- onTimeUp() // called when the timer expires for this question
*/

export default function QuestionCard({
  question,
  index,
  total,
  selectedIndex,
  locked,
  onSelect,
  onTimeUp
}) {
  const [timeLeft, setTimeLeft] = useState(30); // 30s per question

  // reset timer when question changes
  useEffect(() => {
    setTimeLeft(30);
  }, [question.id]);

  useEffect(() => {
    if (locked) return;
    if (timeLeft <= 0) {
      onTimeUp && onTimeUp();
      return;
    }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, locked, onTimeUp]);

  function handleSelect(i) {
    if (locked) return;
    onSelect(question.id, i);
  }

  return (
    <div>
      <div className="meta">
        <div className="muted">Question {index + 1}/{total}</div>
        <div className="muted">Time: {timeLeft}s</div>
      </div>

      <h2 className="qtext">{question.question}</h2>

      <ul className="options" role="list">
        {question.options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = question.correctIndex === i;
          let cls = "option";
          if (locked) {
            if (isCorrect) cls += " correct";
            else if (isSelected) cls += " wrong";
            else cls += " faded";
          } else {
            if (isSelected) cls += " selected";
          }

          return (
            <li key={i}>
              <button
                className={cls}
                onClick={() => handleSelect(i)}
                disabled={locked}
                aria-pressed={isSelected}
              >
                <span className="opt-label">{String.fromCharCode(65 + i)}</span>
                <span className="opt-text">{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}