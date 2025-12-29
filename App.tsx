import React, { useState } from 'react';
import { parseExamContent } from './services/geminiService';
import { TestStructure } from './types';
import QuestionRenderer from './components/QuestionRenderer';
import ListeningPlayer from './components/ListeningPlayer';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [testData, setTestData] = useState<TestStructure | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle text parsing
  const handleGenerateTest = async () => {
    if (!inputText.trim()) {
      setError("Please paste the exam content first.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);

    try {
      const result = await parseExamContent(inputText);
      setTestData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to generate test structure. Please check the content and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file reading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setInputText(event.target.result);
        }
      };
      // Simple text file support. For PDF/Docx in a real app, we'd use pdfjs-dist or similar here.
      // For this demo, we assume the user might upload a .txt or just paste.
      // We will show a hint about PDF/Docx.
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    setTestData(null);
    setInputText('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <header className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">English AI Assessment</h1>
          </div>
          {testData && (
             <button 
               onClick={handleReset}
               className="text-indigo-100 hover:text-white text-sm font-semibold underline"
             >
               Upload New Test
             </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* INPUT SECTION */}
        {!testData && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 animate-fade-in-up">
            <div className="text-center mb-8">
               <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Create Your Interactive Test</h2>
               <p className="text-slate-500">Paste your exam content below or upload a text file. Our AI will format it and generate audio for listening parts.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paste Exam Content (PDF/Word Text)
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-64 p-4 rounded-xl border border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-mono text-sm"
                placeholder="PART A. LISTENING..."
              ></textarea>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="relative overflow-hidden inline-block">
                  <button className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer">
                    Upload .txt File
                  </button>
                  <input 
                    type="file" 
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="absolute left-0 top-0 opacity-0 w-full h-full cursor-pointer"
                  />
               </div>

               <button
                 onClick={handleGenerateTest}
                 disabled={isProcessing || !inputText}
                 className={`w-full md:w-auto px-8 py-3 rounded-lg text-white font-bold text-lg shadow-md transition-all transform hover:-translate-y-0.5 ${
                   isProcessing || !inputText 
                     ? 'bg-slate-400 cursor-not-allowed' 
                     : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                 }`}
               >
                 {isProcessing ? 'Analyzing with AI...' : 'Generate Interactive Test'}
               </button>
            </div>
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            <div className="mt-8 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg">
               <strong>Note:</strong> Since browsers cannot directly parse PDF/Word efficiently without heavy libraries, please copy (Ctrl+A, Ctrl+C) the text from your document and paste it above for the best experience.
            </div>
          </div>
        )}

        {/* TEST RENDER SECTION */}
        {testData && (
          <div className="space-y-8 animate-fade-in">
             <div className="text-center pb-6 border-b border-slate-200">
               <h2 className="text-3xl font-extrabold text-slate-900">{testData.title}</h2>
               <p className="text-slate-500 mt-2">Grade 6 Assessment • Interactive Mode</p>
             </div>

             {testData.sections.map((section, index) => (
               <section key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                 <div className="mb-6">
                    <h3 className="text-2xl font-bold text-indigo-700 mb-2">{section.title}</h3>
                    <p className="text-slate-600 italic">{section.instructions}</p>
                 </div>

                 {/* Listening Audio Player */}
                 {section.isListening && (
                   <ListeningPlayer 
                      sectionTitle={section.title} 
                      transcriptPrompt={section.transcriptPrompt || section.questions[0]?.text} 
                   />
                 )}

                 {/* Questions */}
                 <div className="space-y-2">
                   {section.questions.map((q) => (
                     <QuestionRenderer key={q.id} question={q} />
                   ))}
                 </div>
               </section>
             ))}

             <div className="text-center text-slate-400 py-8 text-sm">
               AI-Powered Assessment created with Gemini API
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
