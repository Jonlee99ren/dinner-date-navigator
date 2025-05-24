interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  answer?: string;
}

export class TavilyService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_TAVILY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Tavily API key not found. Please set VITE_TAVILY_API_KEY in your .env.local file');
    }
  }

  async search(query: string, options: any = {}): Promise<TavilyResponse> {
    if (!this.apiKey) {
      throw new Error('Tavily API key not configured');
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        search_depth: options.searchDepth || 'basic',
        max_results: options.maxResults || 5,
        include_answer: options.includeAnswer || true,
        include_images: options.includeImages || false
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    return response.json();
  }
  async searchRestaurants(query: string, location: string = ''): Promise<string> {
    if (!this.apiKey) {
      return 'Search functionality is not available at the moment.';
    }

    try {
      const searchQuery = `${query} restaurants ${location} menu prices reviews opening hours`.trim();
      
      const response = await this.search(searchQuery, {
        searchDepth: 'basic',
        maxResults: 5,
        includeAnswer: true,
        includeImages: false
      });

      // Format the search results into a readable summary
      let formattedResults = '';
      
      if (response.answer) {
        formattedResults += `Summary: ${response.answer}\n\n`;
      }

      if (response.results && response.results.length > 0) {
        formattedResults += 'Recent information found:\n';
        response.results.slice(0, 3).forEach((result: TavilySearchResult, index: number) => {
          formattedResults += `${index + 1}. ${result.title}\n`;
          formattedResults += `   ${result.content.substring(0, 200)}...\n`;
          formattedResults += `   Source: ${result.url}\n\n`;
        });
      }

      return formattedResults || 'No recent information found for this search.';
    } catch (error) {
      console.error('Tavily search error:', error);
      return 'Unable to search for current information at the moment.';
    }
  }

  async searchSpecificRestaurant(restaurantName: string, location: string): Promise<string> {
    const query = `"${restaurantName}" restaurant ${location} current menu prices hours contact booking`;
    return this.searchRestaurants(query, location);
  }

  async searchCuisineType(cuisineType: string, location: string, budget: string = ''): Promise<string> {
    const query = `${cuisineType} restaurants ${location} ${budget} current open recommendations 2024 2025`;
    return this.searchRestaurants(query, location);
  }
}
