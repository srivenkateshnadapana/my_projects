import React from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function QuizPlayer({ 
  activeItem, 
  quizAnswers, 
  setQuizAnswers, 
  quizResult, 
  setQuizResult, 
  submittingQuiz, 
  handleQuizSubmit 
}) {
  if (!activeItem) return null;

  return (
    <div className="bg-surface-container-lowest rounded-[3rem] p-8 md:p-12 border border-surface-dim/20 shadow-xl">
      <div className="mb-12">
        <h2 className="text-3xl font-headline font-bold text-primary mb-2 uppercase tracking-tight italic">
          {activeItem.title}
        </h2>
        <p className="text-xs font-bold text-secondary uppercase tracking-[0.4em] opacity-60">
          {activeItem.type === 'final' ? 'Final Certification Exam' : 'Module Knowledge Check'}
        </p>
      </div>

      {quizResult ? (
        <div className="py-12 text-center">
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 border-8 ${quizResult.passed || activeItem.type === 'module' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-red-500 bg-red-500/10 text-red-500'}`}>
            <span className="text-4xl font-headline font-bold">{quizResult.percentage}%</span>
          </div>
          <h3 className="text-3xl font-headline font-bold text-primary mb-2">
            {quizResult.passed || activeItem.type === 'module' ? 'Quiz Completed Successfully!' : 'Quiz Failed'}
          </h3>
          <p className="text-on-surface-variant text-lg max-w-md mx-auto mb-8">
            You scored {quizResult.score} out of {quizResult.totalPoints} points.
            {activeItem.type === 'final' && quizResult.passed && " Your certificate has been generated and unlocked."}
            {activeItem.type === 'final' && !quizResult.passed && ` You needed at least ${quizResult.passingScore}% to pass.`}
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => {
              document.getElementById('quiz-questions')?.scrollIntoView({ behavior: 'smooth' })
            }} className="px-8 py-4 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all">
              Review Answers
            </button>
            <button onClick={() => { setQuizResult(null); setQuizAnswers({}); }} className="px-8 py-4 bg-surface-container text-primary rounded-xl font-bold hover:bg-surface-dim transition-colors">
              Retake Quiz
            </button>
          </div>
        </div>
      ) : null}

      <div id="quiz-questions" className={`space-y-12 ${quizResult ? 'mt-12 pt-12 border-t border-surface-dim/20' : ''}`}>
        {activeItem.questions?.length === 0 ? (
          <p className="text-secondary italic text-center py-12">No questions have been configured for this quiz.</p>
        ) : (
          activeItem.questions?.map((q, idx) => {
            const userAnswer = quizAnswers[q.id];
            const correctIdx = q.correctAnswer ?? q.correctOption ?? q.correctOptionIndex;
            
            const questionResult = Array.isArray(quizResult?.results)
              ? quizResult.results.find(r => r.questionId === q.id || r.id === q.id || r._id === q.id)
              : quizResult?.results?.[q.id];
            
            const isCorrect = questionResult ? questionResult.correct : (correctIdx === userAnswer);
            const showFeedback = quizResult !== null;

            return (
              <div key={q.id} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-xl font-bold text-primary flex gap-4">
                    <span className="text-secondary">{idx + 1}.</span> {q.questionText}
                  </h4>
                  {showFeedback && (
                    <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isCorrect ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  )}
                </div>
                <div className="space-y-3 pl-8">
                  {q.options?.map((option, optIdx) => {
                    let variantClasses = "border-surface-dim/20 bg-surface-container-low hover:border-primary/30";
                    if (showFeedback) {
                      if (optIdx === correctIdx) {
                        variantClasses = "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400";
                      } else if (userAnswer === optIdx && !isCorrect) {
                        variantClasses = "border-red-500 bg-red-500/20 text-red-600 dark:text-red-400";
                      } else {
                        variantClasses = "border-surface-dim/10 bg-surface-container-low opacity-40";
                      }
                    } else if (userAnswer === optIdx) {
                      variantClasses = "border-primary bg-primary/5";
                    }

                    return (
                      <label key={optIdx} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${!showFeedback ? 'cursor-pointer' : 'cursor-default'} ${variantClasses}`}>
                        <input 
                          type="radio" 
                          name={`question-${q.id}`} 
                          className="w-5 h-5 accent-primary" 
                          checked={userAnswer === optIdx}
                          disabled={showFeedback}
                          onChange={() => setQuizAnswers(prev => ({...prev, [q.id]: optIdx}))}
                        />
                        <span className="font-medium">{option}</span>
                        {showFeedback && optIdx === correctIdx && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                        {showFeedback && userAnswer === optIdx && !isCorrect && <AlertCircle className="w-4 h-4 text-red-500 ml-auto" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {!quizResult && activeItem.questions?.length > 0 && (
          <div className="pt-8 border-t border-surface-dim/20 flex justify-center">
            <button
              onClick={handleQuizSubmit}
              disabled={submittingQuiz || Object.keys(quizAnswers).length < activeItem.questions.length}
              className="px-12 py-5 signature-gradient text-white rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center gap-3"
            >
              {submittingQuiz ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
