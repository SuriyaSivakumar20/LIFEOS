/**
 * LIFEOS Alfred Orchestration Module
 * Sprint 1: Interfaces, contracts, and prompt templates.
 * AI inference backend integration is planned for subsequent sprints.
 */

export interface AlfredSuggestionPrompt {
  id: string;
  category: 'finance' | 'planning' | 'habits' | 'journal' | 'general';
  label: string;
  prompt: string;
}

export const ALFRED_DEFAULT_SUGGESTIONS: AlfredSuggestionPrompt[] = [
  {
    id: 'sug-1',
    category: 'planning',
    label: "What's on my agenda today?",
    prompt: 'Summarize my priority tasks and any upcoming reminders for today.',
  },
  {
    id: 'sug-2',
    category: 'finance',
    label: 'How is my spending this week?',
    prompt: 'Analyze my recent transactions and give me a category-by-category breakdown.',
  },
  {
    id: 'sug-3',
    category: 'habits',
    label: 'Check my habit streaks',
    prompt: 'Which habits have I completed today, and what are my current active streaks?',
  },
  {
    id: 'sug-4',
    category: 'journal',
    label: 'Daily reflection prompt',
    prompt: 'Give me a thoughtful evening journaling prompt based on my day.',
  },
];

export interface IAlfredAgent {
  isConfigured(): boolean;
  processPrompt(prompt: string): Promise<string>;
}

export class AlfredPlaceholderAgent implements IAlfredAgent {
  isConfigured(): boolean {
    return false;
  }

  async processPrompt(_prompt: string): Promise<string> {
    return 'Alfred offline AI backend is scheduled for an upcoming sprint. All your data remains private and local.';
  }
}
