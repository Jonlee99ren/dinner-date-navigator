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
import LocationService, { LocationData } from './location';

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1/chat/completions";
  private tavilyService: TavilyService;
  private locationService: LocationService;
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.tavilyService = new TavilyService();
    this.locationService = LocationService.getInstance();
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
  }  async generateDinnerResponse(userMessage: string): Promise<string> {
    // Get current location data
    const locationData = this.locationService.getCurrentLocation();
    const locationContext = this.buildLocationContext(locationData);
    
    // Check if the user is asking for specific restaurant information that would benefit from web search
    const needsWebSearch = this.shouldSearchWeb(userMessage);
    let webSearchResults = '';

    if (needsWebSearch) {
      // Extract location and search terms from user message, fallback to current location
      const location = this.extractLocation(userMessage) || this.locationService.getLocationString();
      const searchQuery = this.buildSearchQuery(userMessage);
      
      try {
        webSearchResults = await this.tavilyService.searchRestaurants(searchQuery, location);
      } catch (error) {
        console.error('Web search failed:', error);
        webSearchResults = '';
      }
    }    const systemPrompt = {
      role: 'system' as const,
      content: `You are a smart dinner planner assistant. Help users find restaurants based on their preferences including location, cuisine, budget, ambiance, and timing. Be conversational, friendly, and ask clarifying questions if needed. Keep responses concise and helpful.

      IMPORTANT BEHAVIOR:
      - When you have gathered enough information about their dining preferences (such as cuisine type, general budget range, or dining atmosphere), say "I can help you find restaurants" or "Let me find some restaurants for you" to trigger the restaurant suggestion system.
      - If the user provides specific cuisine, location, or budget information, acknowledge it and indicate you're ready to help find restaurants.
      - Don't keep asking for more details if you have basic preferences - work with what they've given you.
      - If they mention a cuisine type, budget range, or location, that's usually enough to start finding restaurants.
      
      FORMATTING INSTRUCTIONS:
      - Always format your responses using proper Markdown syntax
      - Use **bold** for emphasis on important points
      - Use bullet points (-) or numbered lists when listing items
      - Use headers (##) for main sections if organizing longer responses
      - Make your responses visually appealing and easy to read
      
      ${locationContext}
      
      ${webSearchResults ? `Current restaurant information from the web:\n${webSearchResults}\n\nUse this information to provide accurate, up-to-date recommendations.` : ''}`
    };

    const userPrompt = {
      role: 'user' as const,
      content: `${locationContext ? `[User's current location: ${locationContext}] ` : ''}${userMessage}`
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
    
    // Fallback to current user location if available
    const currentLocation = this.locationService.getCurrentLocation();
    if (currentLocation) {
      return currentLocation.city || currentLocation.address || `${currentLocation.latitude}, ${currentLocation.longitude}`;
    }
    
    return 'Malaysia'; // Final fallback
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
  }  async extractPreferences(conversation: string[]): Promise<any> {
    // Get current location data for context
    const locationData = this.locationService.getCurrentLocation();
    const locationContext = this.buildLocationContext(locationData);
    
    const systemPrompt = {
      role: 'system' as const,
      content: `Analyze the conversation and extract dining preferences. Return a JSON object with the following structure:
      {
        "location": "string - user's preferred dining location or 'Near me' if not specified",
        "time": "string - preferred time or 'Tonight, 7 PM' as default",
        "budget": "string - budget range like 'RM50-100' or use reasonable default",
        "preferences": ["array of dining preferences like cuisine types, atmosphere, etc."]
      }
      
      IMPORTANT:
      - Always provide reasonable defaults if information is missing
      - For location, use user's current location if available: ${locationContext || 'Malaysia'}
      - For budget, estimate based on context or use 'RM60-120' as default
      - For preferences, extract any mentioned cuisine, atmosphere, or dining style
      - Be lenient and work with partial information
      - If minimal info is provided, create a reasonable preference profile`
    };

    const userPrompt = {
      role: 'user' as const,
      content: `Extract preferences from this conversation: ${conversation.join(' ')}`
    };

    const response = await this.generateResponse([systemPrompt, userPrompt]);
    
    try {
      const parsed = JSON.parse(response);
      
      // Ensure we have reasonable defaults
      return {
        location: parsed.location || (locationData ? this.locationService.getLocationString() : 'Malaysia'),
        time: parsed.time || 'Tonight, 7 PM',
        budget: parsed.budget || 'RM60-120',
        preferences: Array.isArray(parsed.preferences) && parsed.preferences.length > 0 
          ? parsed.preferences 
          : ['Good Food', 'Nice Atmosphere']
      };
    } catch {
      // Enhanced fallback with current location if available
      return {
        location: locationData ? this.locationService.getLocationString() : 'Near me',
        time: 'Tonight, 7 PM',
        budget: 'RM60-120',
        preferences: ['Good Food', 'Casual Dining']
      };
    }
  }

  async generateRestaurantSuggestions(preferences: any): Promise<string> {
    // Use Tavily to search for current restaurant information
    const searchQuery = `${preferences.preferences?.join(' ')} restaurants ${preferences.location} ${preferences.budget}`;
    
    try {
      const webResults = await this.tavilyService.searchRestaurants(searchQuery, preferences.location);      const systemPrompt = {
        role: 'system' as const,
        content: `You are a restaurant recommendation expert. Based on the user's preferences and current restaurant information from the web, provide 3-5 specific restaurant suggestions with details like name, cuisine type, price range, and why it matches their preferences.
        
        FORMAT YOUR RESPONSE IN MARKDOWN:
        - Use **bold** for restaurant names and important details
        - Use bullet points (-) for features and key highlights
        - Use proper headers (## or ###) if organizing sections
        - Use emphasis (*italic*) for special notes
        - Make the response visually appealing and easy to read
        - Structure your response to be informative yet concise
        
        EXAMPLE FORMAT:
        ## Top Restaurant Recommendations
        
        **Restaurant Name** - Cuisine Type
        - Location and distance
        - Price range: RM XX-XX
        - *Why it's perfect for you:* explanation
        
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
  async generateStructuredRestaurantData(preferences: any): Promise<any[]> {
    // Get current location data for better search context
    const locationData = this.locationService.getCurrentLocation();
    const locationContext = this.buildLocationContext(locationData);
    
    // Use current location if not specified in preferences
    const searchLocation = preferences.location || 
      (locationData ? this.locationService.getLocationString() : 'Malaysia');
    
    // Use Tavily to search for current restaurant information
    const searchQuery = `${preferences.preferences?.join(' ')} restaurants ${searchLocation} ${preferences.budget}`;
    
    try {
      const webResults = await this.tavilyService.searchRestaurants(searchQuery, searchLocation);
      
      const systemPrompt = {
        role: 'system' as const,
        content: `You are a restaurant recommendation expert. Based on the user's preferences and current restaurant information from the web, provide exactly 3-4 restaurant suggestions as a JSON array.

        Each restaurant object must have this exact structure:
        {
          "id": "unique_id",
          "name": "Restaurant Name",
          "cuisine": "Cuisine Type",
          "rating": 4.5,
          "priceRange": "RM80-120",
          "distance": "2.3 km",
          "description": "Brief appealing description (max 100 chars)",
          "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
          "features": ["Feature1", "Feature2", "Feature3"]
        }

        IMPORTANT:
        - Return ONLY the JSON array, no other text
        - Use realistic Unsplash image URLs for restaurant/food photos
        - Include 2-3 relevant features per restaurant
        - Make descriptions compelling but concise
        - Ensure ratings are between 4.0-5.0
        - Use appropriate distance values (0.5-5 km) based on the user's location
        - If user location is available, prioritize restaurants closer to their location

        ${locationContext ? `User's precise location: ${locationContext}` : ''}

        Current restaurant information from web:
        ${webResults}`
      };

      const userPrompt = {
        role: 'user' as const,
        content: `Generate structured restaurant data for these preferences: Location: ${searchLocation}, Budget: ${preferences.budget}, Preferences: ${preferences.preferences?.join(', ')}${locationContext ? ` | User's current location: ${locationContext}` : ''}`
      };

      const response = await this.generateResponse([systemPrompt, userPrompt]);
        try {
        // Clean up the response to extract JSON
        let cleanResponse = response.trim();
        
        // Remove markdown code blocks if present
        cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Try to find JSON array in the response
        const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          return Array.isArray(parsedData) ? parsedData : [];
        }
        
        // Fallback: try parsing the entire response
        const parsedData = JSON.parse(cleanResponse);
        return Array.isArray(parsedData) ? parsedData : [];
      } catch (parseError) {
        console.error('Error parsing structured restaurant data:', parseError);
        console.log('Raw response:', response);
        // Return fallback restaurants if parsing fails
        return this.getFallbackRestaurants();
      }
    } catch (error) {
      console.error('Error generating structured restaurant data:', error);
      return this.getFallbackRestaurants();
    }
  }

  private getFallbackRestaurants(): any[] {
    return [
      {
        id: 'fallback_1',
        name: 'Local Favorite Restaurant',
        cuisine: 'Local',
        rating: 4.5,
        priceRange: 'RM60-100',
        distance: '2.0 km',
        description: 'Popular local restaurant with great atmosphere and authentic flavors.',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
        features: ['Local Favorite', 'Authentic', 'Good Value']
      },
      {
        id: 'fallback_2',
        name: 'Modern Dining Experience',
        cuisine: 'International',
        rating: 4.3,
        priceRange: 'RM80-130',
        distance: '1.5 km',
        description: 'Contemporary restaurant with innovative dishes and stylish ambiance.',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
        features: ['Modern', 'Innovative', 'Stylish']
      }
    ];
  }

  private buildLocationContext(locationData: LocationData | null): string {
    if (!locationData) return '';
    
    const parts = [];
    
    if (locationData.address) {
      parts.push(`User's current address: ${locationData.address}`);
    } else if (locationData.city && locationData.country) {
      parts.push(`User's current location: ${locationData.city}, ${locationData.country}`);
    }
    
    parts.push(`Coordinates: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`);
    
    if (locationData.accuracy && locationData.accuracy < 100) {
      parts.push(`Location accuracy: ${Math.round(locationData.accuracy)}m (high precision)`);
    }
    
    return parts.join(' | ');
  }
}
