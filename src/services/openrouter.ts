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

import { TavilyService } from './tavily';

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1/chat/completions";
  private tavilyService: TavilyService;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.tavilyService = new TavilyService();
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
    // Check if the user is asking for specific restaurant information that would benefit from web search
    const needsWebSearch = this.shouldSearchWeb(userMessage);
    let webSearchResults = '';

    if (needsWebSearch) {
      // Extract location and search terms from user message
      const location = this.extractLocation(userMessage);
      const searchQuery = this.buildSearchQuery(userMessage);
      
      try {
        webSearchResults = await this.tavilyService.searchRestaurants(searchQuery, location);
      } catch (error) {
        console.error('Web search failed:', error);
        webSearchResults = '';
      }
    }

    const systemPrompt = {
      role: 'system' as const,
      content: `You are a smart dinner planner assistant. Help users find restaurants based on their preferences including location, cuisine, budget, ambiance, and timing. Be conversational, friendly, and ask clarifying questions if needed. Keep responses concise and helpful. When you have enough information about their preferences (location, budget, cuisine type, timing), let them know you can help them find restaurants.
      
      ${webSearchResults ? `Current restaurant information from the web:\n${webSearchResults}\n\nUse this information to provide accurate, up-to-date recommendations.` : ''}`
    };

    const userPrompt = {
      role: 'user' as const,
      content: userMessage
    };

    return this.generateResponse([systemPrompt, userPrompt]);
  }

  private shouldSearchWeb(message: string): boolean {
    const searchKeywords = [
      'restaurants near', 'best restaurants', 'restaurant recommendations',
      'current menu', 'opening hours', 'prices', 'reviews',
      'new restaurants', 'popular restaurants', 'trending'
    ];
    
    return searchKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private extractLocation(message: string): string {
    // Simple location extraction - could be enhanced with NLP
    const locationKeywords = ['near', 'in', 'at', 'around'];
    const words = message.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      if (locationKeywords.includes(words[i].toLowerCase()) && i + 1 < words.length) {
        return words.slice(i + 1, i + 3).join(' '); // Take next 1-2 words
      }
    }
    
    return 'Malaysia'; // Default location
  }

  private buildSearchQuery(message: string): string {
    // Extract key dining preferences for search
    const cuisineTypes = ['italian', 'chinese', 'japanese', 'korean', 'thai', 'indian', 'western', 'local', 'halal'];
    const atmosphereTypes = ['romantic', 'casual', 'fine dining', 'family', 'rooftop', 'beachside'];
    
    let searchTerms = [];
    
    cuisineTypes.forEach(cuisine => {
      if (message.toLowerCase().includes(cuisine)) {
        searchTerms.push(cuisine);
      }
    });
    
    atmosphereTypes.forEach(atmosphere => {
      if (message.toLowerCase().includes(atmosphere)) {
        searchTerms.push(atmosphere);
      }
    });
    
    return searchTerms.length > 0 ? searchTerms.join(' ') : 'restaurant dining';
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

  async generateRestaurantSuggestions(preferences: any): Promise<string> {
    // Use Tavily to search for current restaurant information
    const searchQuery = `${preferences.preferences?.join(' ')} restaurants ${preferences.location} ${preferences.budget}`;
    
    try {
      const webResults = await this.tavilyService.searchRestaurants(searchQuery, preferences.location);
      
      const systemPrompt = {
        role: 'system' as const,
        content: `You are a restaurant recommendation expert. Based on the user's preferences and current restaurant information from the web, provide 3-5 specific restaurant suggestions with details like name, cuisine type, price range, and why it matches their preferences. Format as a clear, organized response.
        
        Current restaurant information:
        ${webResults}`
      };

      const userPrompt = {
        role: 'user' as const,
        content: `Please suggest restaurants based on these preferences: ${JSON.stringify(preferences)}`
      };

      return this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      console.error('Error generating restaurant suggestions:', error);
      return "I'd be happy to help you find restaurants! Here are some general suggestions based on your preferences, though I'm having trouble accessing current information right now.";
    }
  }
}
