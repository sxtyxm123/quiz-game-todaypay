import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, useNavigate, Link } from "react-router-dom";
import QuestionCard from "./components/QuestionCard";
import Results from "./components/Results";
import localQuestions from "./data/questions.json";

/*
  By default this app uses the provided local questions.json.
  To use Open Trivia DB, set USE_API = true and adjust parameters below.
  The app handles loading and errors.
*/
const USE_API = false;
const API_URL =
  "https://opentdb.com/api.php?amount=7&type=multiple&encode=base64"; // example; we decode base64 below

function decodeBase64(s) {
  try {
    return decodeURIComponent(atob(s).split("").map(function (c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
  } catch {
    return s;
  }
}

function normalizeApiResults(apiResults) {
  // apiResults: results array from Open Trivia DB (base64 encoded in this example)
  return apiResults.map((item, idx) => {
    const question = decodeBase64(item.question);
    const correct = decodeBase64(item.correct_answer);
    const incorrect = item.incorrect_answers.map(a => decodeBase64(a));
    // merge and shuffle
    const options = [...incorrect, correct].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correct);
    return {
      id: `api-${idx}`,
      question,
      options,
      correctIndex,
      difficulty: item.difficulty || "medium"
    };
  });
}

export default function App() {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
  const [locked, setLocked] = useState({}); // { questionId: true }
  const [score, setScore] = useState(0);
  const [topScore, setTopScore] = useState(
    Number(localStorage.getItem("topScore") || 0)
  );

  // Load questions (API or local)
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (USE_API) {
          const res = await fetch(API_URL, { cache: "no-cache" });
          if (!res.ok) throw new Error("Failed to fetch questions.");
          const data = await res.json();
          // when using base64 encode param, data.results are base64 strings
          const normalized = normalizeApiResults(data.results);
          setQuestions(normalized);
        } else {
          // local JSON import
          setQuestions(localQuestions);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Unknown error");
        setLoading(false);
      }
    }
    load();
  }, []);

  // Initialize/Reset quiz state when questions load
  useEffect(() => {
    if (!questions) return;
    setCurrentIdx(0);
    setAnswers({});
    setLocked({});
    setScore(0);
  }, [questions]);

  const handleSelect = useCallback(
    (questionId, selectedIndex) => {
      if (!questions) return;
      if (locked[questionId]) return;
      // lock the answer for that question
      setAnswers(prev => ({ ...prev, [questionId]: selectedIndex }));
      setLocked(prev => ({ ...prev, [questionId]: true }));
      // scoring immediate
      const q = questions.find(q => q.id === questionId);
      if (q && q.correctIndex === selectedIndex) {
        setScore(prev => prev + 1);
      }
    },
    [locked, questions]
  );

  const goNext = () => {
    if (!questions) return;
    if (currentIdx < questions.length - 1) setCurrentIdx(i => i + 1);
  };

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  };

  const submitQuiz = () => {
    // compute final score (already tracked live, but ensure correct)
    // Recompute to be safe
    let computed = 0;
    for (const q of questions) {
      const selected = answers[q.id];
      if (selected === q.correctIndex) computed += 1;
    }
    setScore(computed);
    // persist top score
    if (computed > topScore) {
      setTopScore(computed);
      localStorage.setItem("topScore", String(computed));
    }
    navigate("/results", { replace: true });
  };

  const restart = () => {
    // clear answers and scores and go back to quiz start
    setAnswers({});
    setLocked({});
    setScore(0);
    setCurrentIdx(0);
    navigate("/quiz", { replace: true });
  };

  if (loading) {
    return (
      <div className="app-center">
        <div className="card">
          <h2>Loading questions...</h2>
          <p className="muted">This app can use local JSON or Open Trivia DB.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-center">
        <div className="card">
          <h2>Error loading questions</h2>
          <p className="muted">{error}</p>
          <button onClick={() => window.location.reload()} className="btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="app-center">
        <div className="card">
          <h2>No questions found</h2>
          <p className="muted">Please add questions.json or enable the API.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrap">
      <header className="header">
        <Link to="/" className="logo">Quiz App</Link>
        <div className="header-right">
          <span className="muted">Top: {topScore}/{questions.length}</span>
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <div className="card">
                <h1>Welcome</h1>
                <p className="muted">A small React quiz app — 1 question at a time.</p>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Link to="/quiz" className="btn">Start Quiz</Link>
                  <Link to="/results" className="btn btn-ghost">View Results (if any)</Link>
                </div>
              </div>
            }
          />

          <Route
            path="/quiz"
            element={
              <div className="card">
                <QuestionCard
                  question={questions[currentIdx]}
                  index={currentIdx}
                  total={questions.length}
                  selectedIndex={answers[questions[currentIdx].id]}
                  locked={!!locked[questions[currentIdx].id]}
                  onSelect={handleSelect}
                  onTimeUp={() => {
                    // if time runs out and user didn't answer, lock as incorrect
                    const qid = questions[currentIdx].id;
                    if (!locked[qid]) {
                      setLocked(prev => ({ ...prev, [qid]: true }));
                      setAnswers(prev => ({ ...prev, [qid]: null }));
                    }
                  }}
                />

                <div className="controls">
                  <button onClick={goPrev} className="btn btn-ghost" disabled={currentIdx === 0}>
                    Previous
                  </button>
                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={goNext}
                      className="btn"
                      disabled={!locked[questions[currentIdx].id]}
                      title={!locked[questions[currentIdx].id] ? "Select an answer to proceed" : ""}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={submitQuiz}
                      className="btn primary"
                      disabled={Object.keys(locked).length < questions.length}
                      title={Object.keys(locked).length < questions.length ? "Finish after answering all questions" : ""}
                    >
                      Submit
                    </button>
                  )}
                </div>
                <div className="progress muted">
                  Question {currentIdx + 1} of {questions.length} • Score: {score}
                </div>
              </div>
            }
          />

          <Route
            path="/results"
            element={
              <Results
                questions={questions}
                answers={answers}
                score={score}
                restart={restart}
              />
            }
          />
        </Routes>
      </main>

      <footer className="footer">
        <small className="muted">Built with React — uses local JSON by default. sxtyxm123</small>
      </footer>
    </div>
  );
}