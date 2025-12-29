export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
  REWRITE_SENTENCE = 'REWRITE_SENTENCE'
}

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  number: number;
  text: string; // The question stem or the sentence with a blank
  type: QuestionType;
  options?: Option[]; // For MCQ
  correctAnswer: string; // The correct option ID or the string text
  explanation?: string;
}

export interface Section {
  id: string;
  title: string; // e.g., "PART A. LISTENING"
  instructions: string;
  questions: Question[];
  isListening: boolean;
  transcriptPrompt?: string; // Prompt for AI to generate the audio script if the script isn't explicit
}

export interface TestStructure {
  title: string;
  sections: Section[];
}
