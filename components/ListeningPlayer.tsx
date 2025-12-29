import React, { useState } from 'react';
import { generateSpeechForSection } from '../services/geminiService';

interface ListeningPlayerProps {
  sectionTitle: string;
  transcriptPrompt?: string;
}

const ListeningPlayer: React.FC<ListeningPlayerProps> = ({ sectionTitle, transcriptPrompt }) => {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAudio = async () => {
    if (!transcriptPrompt) return;
    
    setLoading(true);
    setError(null);
    try {
      const audioBlob = await generateSpeechForSection(transcriptPrompt);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      console.error(err);
      setError("Failed to generate audio. Check API Key or try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!transcriptPrompt) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-blue-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0117 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0113 10a3.983 3.983 0 01-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            AI Audio for {sectionTitle}
          </h4>
          <p className="text-sm text-blue-600 mt-1">
            Generated using Gemini 2.5 Flash TTS
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!audioUrl && (
            <button
              onClick={handleGenerateAudio}
              disabled={loading}
              className={`px-4 py-2 rounded-md font-semibold text-white transition-colors ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Audio...
                </span>
              ) : (
                "Generate Audio"
              )}
            </button>
          )}

          {audioUrl && (
            <div className="flex items-center gap-2">
              <audio controls src={audioUrl} className="h-10" />
              <a 
                href={audioUrl} 
                download={`${sectionTitle.replace(/\s+/g, '_')}_audio.wav`}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
                title="Download WAV"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ListeningPlayer;
