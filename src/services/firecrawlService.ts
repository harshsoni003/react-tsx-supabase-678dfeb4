import FireCrawlApp from '@mendable/firecrawl-js';

const FIRECRAWL_API_KEY = process.env.REACT_APP_FIRECRAWL_API_KEY || '';

class FireCrawlService {
  private app: FireCrawlApp;

  constructor() {
    if (!FIRECRAWL_API_KEY) {
      console.warn('FireCrawl API key is not set. Please add REACT_APP_FIRECRAWL_API_KEY to your .env file.');
    }
    this.app = new FireCrawlApp({ apiKey: FIRECRAWL_API_KEY });
  }

  async scrapeWebsite(url: string): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      console.log('Scraping website:', url);
      
      const scrapeResult = await this.app.scrapeUrl(url, {
        formats: ['markdown'],
        onlyMainContent: true
      });

      if (scrapeResult.success) {
        console.log('Website scraped successfully');
        console.log('Scrape result:', scrapeResult);
        
        // Cast to any to access the dynamic properties safely
        const result = scrapeResult as any;
        
        // Try to extract content from various possible properties
        const content = result.markdown || 
                       result.data?.markdown || 
                       result.data?.content || 
                       '';
        
        return {
          success: true,
          content: content
        };
      } else {
        console.error('Scraping failed:', scrapeResult);
        return {
          success: false,
          error: 'Failed to scrape website content'
        };
      }
    } catch (error) {
      console.error('Error scraping website:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while scraping'
      };
    }
  }
}

export const firecrawlService = new FireCrawlService();
