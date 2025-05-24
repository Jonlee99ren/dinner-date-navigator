interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1/chat/completions";

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your .env.local file');
    }
  }

  async generateResponse(messages: Message[]): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://dinner-date-navigator.vercel.app",
          "X-Title": "Smart Dinner Planner",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "meta-llama/llama-3.3-8b-instruct:free",
          "messages": messages
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return "I'm having trouble connecting right now. Please try again.";
    }
  }

  async generateDinnerResponse(userMessage: string): Promise<string> {
    const systemPrompt = {
      role: 'system' as const,
      content: `You are a smart dinner planner assistant. Help users find restaurants based on their preferences including location, cuisine, budget, ambiance, and timing. Be conversational, friendly, and ask clarifying questions if needed. Keep responses concise and helpful. When you have enough information about their preferences (location, budget, cuisine type, timing), let them know you can help them find restaurants.`
    };

    const userPrompt = {
      role: 'user' as const,
      content: userMessage
    };

    return this.generateResponse([systemPrompt, userPrompt]);
  }

  async extractPreferences(conversation: string[]): Promise<any> {
    const systemPrompt = {
      role: 'system' as const,
      content: `Analyze the conversation and extract dining preferences. Return a JSON object with location, time, budget, and preferences array. If information is missing, use reasonable defaults.`
    };

    const userPrompt = {
      role: 'user' as const,
      content: `Extract preferences from this conversation: ${conversation.join(' ')}`
    };

    const response = await this.generateResponse([systemPrompt, userPrompt]);
    
    try {
      return JSON.parse(response);
    } catch {
      // Fallback if JSON parsing fails
      return {
        location: 'Near me',
        time: 'Tonight, 7 PM',
        budget: 'RM100–150',
        preferences: ['Casual Dining']
      };
    }
  }
}
