import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TestStructure, QuestionType } from '../types';

// Helper to get AI instance
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Parses raw exam text into a structured JSON object for the app.
 */
export const parseExamContent = async (rawText: string): Promise<TestStructure> => {
  const ai = getAI();
  
  const systemInstruction = `
    You are an expert educational content parser for Grade 6 English exams in Vietnam.
    Your task is to take raw exam text (often copied from PDF/Word) and convert it into a structured JSON format.
    
    Structure the output to identify:
    1. The Test Title
    2. Sections (PART A, PART B, etc.)
    3. Questions within sections.
    
    Specific Rules:
    - Detect 'Multiple Choice' questions (A, B, C, D).
    - Detect 'True/False' questions.
    - Detect 'Fill in the blank' or 'Find mistake' questions. For these, the 'type' should be FILL_IN_THE_BLANK.
    - Detect 'Rewrite sentence' questions.
    - For Listening parts, if no script is provided in the text, generate a 'transcriptPrompt' field describing what the audio should be about based on the questions (e.g., "A conversation between Mai and her friend about her house").
    - Clean up formatting artifacts (like underscores '___' or line numbers).
    - Ensure 'correctAnswer' is populated. If the answer key is NOT in the text, you must infer the most likely correct answer based on Grade 6 English knowledge.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: rawText,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                instructions: { type: Type.STRING },
                isListening: { type: Type.BOOLEAN },
                transcriptPrompt: { type: Type.STRING, nullable: true },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      number: { type: Type.INTEGER },
                      text: { type: Type.STRING },
                      type: { type: Type.STRING, enum: [
                        QuestionType.MULTIPLE_CHOICE,
                        QuestionType.TRUE_FALSE,
                        QuestionType.FILL_IN_THE_BLANK,
                        QuestionType.REWRITE_SENTENCE
                      ]},
                      options: {
                        type: Type.ARRAY,
                        nullable: true,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            text: { type: Type.STRING }
                          }
                        }
                      },
                      correctAnswer: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                    required: ["id", "number", "text", "type", "correctAnswer"]
                  }
                }
              },
              required: ["id", "title", "instructions", "isListening", "questions"]
            }
          }
        },
        required: ["title", "sections"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to parse content");
  }

  return JSON.parse(response.text) as TestStructure;
};

/**
 * Generates speech audio from text using Gemini TTS.
 */
export const generateSpeechForSection = async (transcriptOrPrompt: string): Promise<Blob> => {
  const ai = getAI();

  // If the input looks like a prompt ("Describe a house..."), ask Gemini to generate the script first, then TTS it.
  // However, for simplicity and speed in this demo, we will ask the model to generate the audio directly 
  // by providing the context as the input text.
  
  // We need to ensure the model actually reads a script. 
  // Let's first generate a script if it's just a prompt.
  let scriptToRead = transcriptOrPrompt;

  if (transcriptOrPrompt.length < 200 && !transcriptOrPrompt.includes(":")) {
     // It's likely a prompt description, not the full script. Let's expand it.
     const scriptResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short English listening transcript (approx 100-150 words) suitable for Grade 6 based on this description: "${transcriptOrPrompt}". Format it as a natural conversation or monologue.`
     });
     if (scriptResponse.text) {
        scriptToRead = scriptResponse.text;
     }
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: scriptToRead }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is usually a good clear voice
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("No audio data returned");
  }

  // Convert Base64 to Blob
  const byteCharacters = atob(base64Audio);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  
  // Return standard WAV blob (Gemini returns raw PCM usually, but the SDK/Model often encapsulates it or we treat it as raw. 
  // However, typically for browsers to play it easily without decoding headers, we might need a container.
  // Note: The specific model usually outputs a format that might need decoding or is raw PCM.
  // The provided example in instructions shows decoding PCM.
  // FOR SIMPLICITY in this specific output task without complex audio context boilerplate in the main UI file:
  // We will assume the browser can handle the raw data if we hint it correctly or we construct a simple WAVE header.
  // Actually, standard HTML5 audio usually needs a container (WAV/MP3). 
  // Gemini TTS output is often raw PCM. Let's add a simple WAV header function helper.
  
  return createWavFile(byteArray);
};

// Helper to add WAV header to raw PCM data (Assuming 24kHz mono as per common defaults)
function createWavFile(samples: Uint8Array): Blob {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16; // Typically 16-bit PCM

    const buffer = new ArrayBuffer(44 + samples.length);
    const view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    /* bits per sample */
    view.setUint16(34, bitsPerSample, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length, true);

    // Write the PCM samples
    const dataView = new Uint8Array(buffer, 44);
    dataView.set(samples);

    return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
