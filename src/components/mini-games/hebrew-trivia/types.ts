export interface Question {
  question_he: string;
  correct_answer_he: string;
  incorrect_answers_he: string[];
  // Optional: Add context/explanation field if needed for feedback
  // explanation_he?: string;
}

export type QuestionSet = Question[];

export interface HebrewTriviaGameProps {
  questionSet: QuestionSet;
  onGameComplete: (finalScore: number) => void; // Callback when the game ends
  topic_he?: string; // Optional topic/title for the trivia set
}
