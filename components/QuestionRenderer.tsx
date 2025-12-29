import React, { useState } from 'react';
import { Question, QuestionType } from '../types';

interface QuestionRendererProps {
  question: Question;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  // --- Logic for Multiple Choice ---
  const handleOptionClick = (optionId: string) => {
    setUserAnswer(optionId);
    
    // Check ignoring case and trimming
    const cleanCorrect = question.correctAnswer.trim().toLowerCase();
    const cleanUser = optionId.trim().toLowerCase();
    
    // Sometimes the correct answer is the full text, sometimes just the letter 'A'
    // Let's assume if optionId matches the start of correctAnswer or vice versa
    const isCorrect = cleanUser === cleanCorrect || cleanCorrect.startsWith(cleanUser) || cleanUser.startsWith(cleanCorrect);

    setStatus(isCorrect ? 'correct' : 'incorrect');
  };

  // --- Logic for Text Input (Fill Blank / Rewrite) ---
  const handleInputBlur = () => {
    if (!userAnswer.trim()) {
      setStatus('idle');
      return;
    }
    const cleanCorrect = question.correctAnswer.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const cleanUser = userAnswer.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    
    // Use simple string matching. For rewrite, this might be strict, but sufficient for a demo.
    if (cleanUser === cleanCorrect) {
      setStatus('correct');
    } else {
      setStatus('incorrect');
    }
  };

  const getStatusColor = () => {
    if (status === 'correct') return 'bg-green-100 border-green-500 text-green-900';
    if (status === 'incorrect') return 'bg-red-100 border-red-500 text-red-900';
    return 'bg-white border-slate-200 hover:border-blue-300';
  };

  return (
    <div className="mb-6 p-4 rounded-xl border border-slate-200 shadow-sm bg-white transition-all">
      <div className="flex justify-between items-start mb-3">
        <h5 className="font-bold text-slate-800 text-lg mr-2">
          {question.number}.
        </h5>
        <button 
          onClick={() => setShowAnswer(!showAnswer)}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 underline"
        >
          {showAnswer ? 'Hide Answer' : 'Show Answer'}
        </button>
      </div>

      <div className="mb-4 text-slate-700 text-lg" dangerouslySetInnerHTML={{ __html: question.text }} />

      {/* RENDER BASED ON TYPE */}
      
      {(question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.TRUE_FALSE) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options?.map((opt) => {
             // Determine style for this specific option button
             let btnClass = "w-full text-left p-3 rounded-lg border-2 transition-all font-medium ";
             if (userAnswer === opt.id) {
                if (status === 'correct') btnClass += "bg-green-100 border-green-500 text-green-900";
                else if (status === 'incorrect') btnClass += "bg-red-100 border-red-500 text-red-900";
                else btnClass += "bg-blue-50 border-blue-200";
             } else {
               btnClass += "bg-white border-slate-200 hover:bg-slate-50 hover:border-blue-300";
             }

             return (
               <button
                 key={opt.id}
                 onClick={() => handleOptionClick(opt.id)}
                 className={btnClass}
               >
                 <span className="font-bold mr-2">{opt.id}.</span> {opt.text}
               </button>
             );
          })}
        </div>
      )}

      {(question.type === QuestionType.FILL_IN_THE_BLANK || question.type === QuestionType.REWRITE_SENTENCE) && (
        <div className="relative">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onBlur={handleInputBlur}
            placeholder="Type your answer here..."
            className={`w-full p-3 rounded-lg border-2 outline-none transition-all text-lg ${
                status === 'correct' ? 'border-green-500 bg-green-50 text-green-900' :
                status === 'incorrect' ? 'border-red-500 bg-red-50 text-red-900' :
                'border-slate-300 focus:border-blue-400'
            }`}
          />
          {status === 'correct' && (
             <span className="absolute right-4 top-3 text-green-600">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
             </span>
          )}
          {status === 'incorrect' && (
             <span className="absolute right-4 top-3 text-red-500 text-sm font-semibold">
               Try Again
             </span>
          )}
        </div>
      )}

      {/* ANSWER REVEAL */}
      {showAnswer && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md animate-fade-in text-yellow-900">
          <p className="font-bold text-sm uppercase tracking-wide opacity-80 mb-1">Correct Answer:</p>
          <p className="text-lg font-mono text-yellow-800">{question.correctAnswer}</p>
          {question.explanation && (
            <p className="text-sm mt-2 italic border-t border-yellow-200 pt-2">{question.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;
