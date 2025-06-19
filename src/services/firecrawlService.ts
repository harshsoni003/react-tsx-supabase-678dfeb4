import FireCrawlApp from '@mendable/firecrawl-js';
import { getElevenLabsApiKey } from '@/services/elevenlabs';

const FIRECRAWL_API_KEY = 'fc-fd1793491436412a8240a776b4d78243';

type CrawlFormat = "markdown" | "html" | "rawHtml" | "content" | "links" | "screenshot" | "screenshot@fullPage" | "extract" | "json" | "changeTracking";

interface CrawlResult {
  success: boolean;
  knowledgeBaseId?: string;
  content?: string;
  error?: string;
  totalPages?: number;
  message?: string;
}

interface CrawlOptions {
  limit?: number;
  maxDepth?: number;
  excludePaths?: string[];
  includePaths?: string[];
  allowBackwardLinks?: boolean;
  ignoreSitemap?: boolean;
  scrapeOptions?: {
    formats?: CrawlFormat[];
    onlyMainContent?: boolean;
    removeBase64Images?: boolean;
    excludeTags?: string[];
    includeTags?: string[];
    waitFor?: number;
    timeout?: number;
    maxAge?: number;
  };
}

interface ExtractResult {
  success: boolean;
  data?: any;
  content?: string;
  error?: string;
}

class FireCrawlService {
  private app: FireCrawlApp;

  constructor() {
    this.app = new FireCrawlApp({ apiKey: FIRECRAWL_API_KEY });
  }

  /**
   * Extract company information using FIRE-1 agent for intelligent navigation
   */
  async extractCompanyInformationWithFIRE1(url: string): Promise<ExtractResult> {
    try {
      console.log('🤖 Starting FIRE-1 agent extraction for:', url);
      
      // Enhanced URL for better coverage - add /* for entire website scanning
      const enhancedUrl = url.endsWith('/') ? `${url}*` : `${url}/*`;
      console.log('🔍 Enhanced URL for extraction:', enhancedUrl);
      
      const extractSchema = {
        type: "object",
        properties: {
          "Company Name": {
            type: "string",
            description: "The official name of the company"
          },
          "Company Industry Type": {
            type: "string",
            description: "The industry or sector the company operates in"
          },
          "Company Summary": {
            type: "string",
            description: "A brief overview of what the company does"
          },
          "Company Services Provided": {
            type: "array",
            items: {
              type: "object",
              properties: {
                "service": { type: "string" },
                "description": { type: "string" }
              }
            },
            description: "List of services offered by the company with descriptions"
          },
          "Company Pricings": {
            type: "array",
            items: {
              type: "object",
              properties: {
                "plan": { type: "string" },
                "price": { type: "string" },
                "features": { type: "string" }
              }
            },
            description: "Pricing plans and package information"
          },
          "Company Email and contact details": {
            type: "string",
            description: "Contact information including email, phone, address"
          },
          "Company FAQ": {
            type: "array",
            items: {
              type: "object",
              properties: {
                "question": { type: "string" },
                "answer": { type: "string" }
              }
            },
            description: "Frequently asked questions and their answers"
          },
          "Company Socials accounts": {
            type: "object",
            properties: {
              "youtube": { type: "string" },
              "twitter": { type: "string" },
              "linkedin": { type: "string" },
              "instagram": { type: "string" },
              "other_socials": { type: "string" }
            },
            description: "Social media account links or usernames"
          },
          "Value proposition": {
            type: "string",
            description: "The company's main value proposition or unique selling point"
          },
          "Problem Company is solving": {
            type: "string",
            description: "The main problem or pain point the company addresses"
          },
          "Company Solution to the problem": {
            type: "string",
            description: "How the company solves the identified problem"
          },
          "Company CTA": {
            type: "string",
            description: "Main call-to-action or how customers can get started"
          },
          "Other IMP Company Information": {
            type: "string",
            description: "Any other important company information not covered above"
          }
        },
        required: [
          "Company Name",
          "Company Industry Type", 
          "Company Summary",
          "Company Services Provided",
          "Company Pricings",
          "Company Email and contact details",
          "Company FAQ",
          "Company Socials accounts",
          "Value proposition",
          "Problem Company is solving",
          "Company Solution to the problem",
          "Company CTA",
          "Other IMP Company Information"
        ]
      };

      const extractPrompt = `You are an expert extraction algorithm.
Only extract relevant information from the text.
If you don't know anything then just add "use your Agent knowledge base to find the information". Do not make-up them yourself, do not hallucinate.

Your task is to extract company information in below format:

FORMAT:
[Company Information]
#Company Name:
#Company Industry Type:
#Company Summary:
#Company Services Provided: 
1. Service & description of service:
2. ...
#Company Pricings:
Pricings and Package information:
1. Pricing details:
2. Pricing detail
...
#Company Email and contact details:
#Company FAQ:
FAQ questions & their answers:
1.Question
  1.Ans
2nd: Q
  2.Ans
...
#All Company Socials accounts username or links(if given):
 -YT:
 -X(twitter):
 -LinkedIn:
 -Instagram:
 -Other socials:
# Other IMP Company Information:
#Value proposition: (example: I help you build voice AI for your business.)
#Problem Company is solving:
#Company Solution to the problem:
#Company CTA:

Navigate through the website intelligently to find this information. Look for:
- About pages, services pages, pricing pages
- Contact or footer sections for contact info and social links
- FAQ or help sections
- Product or solution descriptions
- Any call-to-action buttons or sections

Use the FIRE-1 agent capabilities to click through different pages and sections to gather comprehensive information.`;

      const extractParams = {
        prompt: extractPrompt,
        schema: extractSchema,
        agent: {
          model: "FIRE-1"
        }
      };

      console.log('🔧 Extract parameters:', JSON.stringify(extractParams, null, 2));
      
      const extractResult = await this.app.extract([enhancedUrl], extractParams);
      
      if (extractResult.success && extractResult.data) {
        console.log('✅ FIRE-1 extraction completed successfully');
        console.log('📊 Extracted data:', JSON.stringify(extractResult.data, null, 2));
        
        return {
          success: true,
          data: extractResult.data,
          content: this.formatExtractedData(extractResult.data)
        };
      } else {
        console.error('❌ FIRE-1 extraction failed:', extractResult);
        return {
          success: false,
          error: extractResult.error || 'Failed to extract company information with FIRE-1'
        };
      }
    } catch (error) {
      console.error('🚨 Error in FIRE-1 extraction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during FIRE-1 extraction'
      };
    }
  }

  /**
   * Format extracted data into a readable string format
   */
  private formatExtractedData(data: any): string {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return '';
    }

    const companyData = data[0]; // Take first result
    let formatted = '[Company Information]\n\n';

    // Format each section
    formatted += `#Company Name: ${companyData['Company Name'] || 'Couldn\'t be Found in Website'}\n\n`;
    formatted += `#Company Industry Type: ${companyData['Company Industry Type'] || 'Couldn\'t be Found in Website'}\n\n`;
    formatted += `#Company Summary: ${companyData['Company Summary'] || 'Couldn\'t be Found in Website'}\n\n`;

    // Services
    formatted += '#Company Services Provided:\n';
    const services = companyData['Company Services Provided'];
    if (Array.isArray(services) && services.length > 0) {
      services.forEach((service: any, index: number) => {
        formatted += `${index + 1}. ${service.service || 'Service'}: ${service.description || 'No description available'}\n`;
      });
    } else {
      formatted += 'Couldn\'t be Found in Website\n';
    }
    formatted += '\n';

    // Pricing
    formatted += '#Company Pricings:\n';
    const pricing = companyData['Company Pricings'];
    if (Array.isArray(pricing) && pricing.length > 0) {
      pricing.forEach((plan: any, index: number) => {
        formatted += `${index + 1}. ${plan.plan || 'Plan'}: ${plan.price || 'Price not specified'}\n`;
        if (plan.features) {
          formatted += `   Features: ${plan.features}\n`;
        }
      });
    } else {
      formatted += 'Couldn\'t be Found in Website\n';
    }
    formatted += '\n';

    formatted += `#Company Email and contact details: ${companyData['Company Email and contact details'] || 'Couldn\'t be Found in Website'}\n\n`;

    // FAQ
    formatted += '#Company FAQ:\n';
    const faq = companyData['Company FAQ'];
    if (Array.isArray(faq) && faq.length > 0) {
      faq.forEach((item: any, index: number) => {
        formatted += `${index + 1}. ${item.question || 'Question'}\n`;
        formatted += `   ${item.answer || 'Answer not available'}\n`;
      });
    } else {
      formatted += 'Couldn\'t be Found in Website\n';
    }
    formatted += '\n';

    // Social accounts
    formatted += '#All Company Socials accounts username or links:\n';
    const socials = companyData['Company Socials accounts'];
    if (socials && typeof socials === 'object') {
      formatted += ` -YT: ${socials.youtube || 'Couldn\'t be Found in Website'}\n`;
      formatted += ` -X(twitter): ${socials.twitter || 'Couldn\'t be Found in Website'}\n`;
      formatted += ` -LinkedIn: ${socials.linkedin || 'Couldn\'t be Found in Website'}\n`;
      formatted += ` -Instagram: ${socials.instagram || 'Couldn\'t be Found in Website'}\n`;
      formatted += ` -Other socials: ${socials.other_socials || 'Couldn\'t be Found in Website'}\n`;
    } else {
      formatted += 'Couldn\'t be Found in Website\n';
    }
    formatted += '\n';

    formatted += `#Value proposition: ${companyData['Value proposition'] || 'Couldn\'t be Found in Website'}\n\n`;
    formatted += `#Problem Company is solving: ${companyData['Problem Company is solving'] || 'Couldn\'t be Found in Website'}\n\n`;
    formatted += `#Company Solution to the problem: ${companyData['Company Solution to the problem'] || 'Couldn\'t be Found in Website'}\n\n`;
    formatted += `#Company CTA: ${companyData['Company CTA'] || 'Couldn\'t be Found in Website'}\n\n`;
    formatted += `#Other IMP Company Information: ${companyData['Other IMP Company Information'] || 'Couldn\'t be Found in Website'}\n\n`;

    return formatted;
  }

  /**
   * Test function to verify crawl endpoint using async method
   */
  async testCrawlEndpoint(url: string): Promise<{ endpoint: string; success: boolean; pageCount?: number; error?: string }> {
    try {
      console.log('🧪 Testing ASYNC crawl endpoint for:', url);
      
      const crawlParams = {
        limit: 5, // Small limit for testing
        scrapeOptions: {
          formats: ['markdown'] as CrawlFormat[],
          onlyMainContent: true
        }
      };

      console.log('🔧 Async crawl test parameters:', JSON.stringify(crawlParams, null, 2));
      
      // Use ASYNC crawl to ensure we hit the /crawl endpoint
      const startResult = await this.app.asyncCrawlUrl(url, crawlParams);
      
      if (!startResult.success) {
        return {
          endpoint: 'async-crawl-failed',
          success: false,
          error: (startResult as any).error || 'Failed to start async crawl'
        };
      }

      console.log('✅ Async crawl started with ID:', startResult.id);
      
      // Wait and check status
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        attempts++;
        
        try {
          const status = await this.app.checkCrawlStatus(startResult.id!) as any;
          console.log(`📊 Crawl status check ${attempts}:`, status.status);
          
          if (status.status === 'completed') {
            const pageCount = status.data?.length || 0;
            console.log('✅ Async crawl completed - Pages found:', pageCount);
            
            return {
              endpoint: '/crawl (async)',
              success: true,
              pageCount
            };
          } else if (status.status === 'failed') {
            return {
              endpoint: '/crawl (async-failed)',
              success: false,
              error: 'Crawl job failed'
            };
          }
          // Continue waiting for scraping/in-progress status
        } catch (statusError) {
          console.warn('Status check error:', statusError);
        }
      }
      
      return {
        endpoint: '/crawl (async-timeout)',
        success: false,
        error: 'Crawl timed out after 30 seconds'
      };
      
    } catch (error) {
      console.error('🚨 Async crawl test error:', error);
      return {
        endpoint: 'error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Enhanced scrape method with FIRE-1 agent option
   */
  async scrapeWebsite(url: string, useFIRE1: boolean = false): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      console.log('Scraping website:', url, useFIRE1 ? 'with FIRE-1 agent' : 'standard scrape');
      
      if (useFIRE1) {
        // Use FIRE-1 agent for intelligent scraping
        const extractResult = await this.extractCompanyInformationWithFIRE1(url);
        if (extractResult.success) {
          return {
            success: true,
            content: extractResult.content
          };
        } else {
          // Fallback to standard scraping if FIRE-1 fails
          console.warn('FIRE-1 extraction failed, falling back to standard scraping');
        }
      }
      
      const scrapeResult = await this.app.scrapeUrl(url, {
        formats: ['markdown'] as CrawlFormat[],
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

  /**
   * Crawl website using ASYNC method to ensure /crawl endpoint is used
   */
  async crawlWebsiteToKnowledgeBase(
    url: string, 
    companyName: string, 
    options: CrawlOptions = {}
  ): Promise<CrawlResult> {
    try {
      console.log('🚀 Starting ASYNC website crawl for:', url);
      console.log('🔧 Crawl options provided:', JSON.stringify(options, null, 2));
      
      // Configure crawl parameters according to Firecrawl API docs
      // Using structure from the playground example
      const crawlParams = {
        limit: options.limit || 25,
        ...(options.maxDepth && { maxDepth: options.maxDepth }),
        ...(options.excludePaths && { excludePaths: options.excludePaths }),
        ...(options.includePaths && { includeOnlyPaths: options.includePaths }), // Note: API uses includeOnlyPaths
        ...(options.ignoreSitemap !== undefined && { ignoreSitemap: options.ignoreSitemap }),
        ...(options.allowBackwardLinks !== undefined && { allowBackwardsLinks: options.allowBackwardLinks }), // Note: API uses allowBackwardsLinks
        scrapeOptions: {
          formats: (options.scrapeOptions?.formats || ['markdown']) as CrawlFormat[],
          onlyMainContent: options.scrapeOptions?.onlyMainContent !== false, // Default to true
          ...(options.scrapeOptions?.removeBase64Images !== undefined && { removeBase64Images: options.scrapeOptions.removeBase64Images }),
          ...(options.scrapeOptions?.excludeTags && { excludeTags: options.scrapeOptions.excludeTags }),
          ...(options.scrapeOptions?.includeTags && { includeTags: options.scrapeOptions.includeTags }),
          ...(options.scrapeOptions?.waitFor && { waitFor: options.scrapeOptions.waitFor }),
          ...(options.scrapeOptions?.timeout && { timeout: options.scrapeOptions.timeout }),
          ...(options.scrapeOptions?.maxAge && { maxAge: options.scrapeOptions.maxAge })
        }
      };

      console.log('📋 Final crawl parameters:', JSON.stringify(crawlParams, null, 2));

      // Use ASYNC crawl to ensure we hit the /crawl endpoint
      const startTime = Date.now();
      const crawlStart = await this.app.asyncCrawlUrl(url, crawlParams);
      
      if (!crawlStart.success) {
        console.error('❌ Failed to start crawl:', crawlStart);
        return {
          success: false,
          error: `Failed to start crawl: ${(crawlStart as any).error || 'Unknown error'}`
        };
      }

      console.log('✅ Crawl started with ID:', crawlStart.id);
      
      // Poll for completion
      let attempts = 0;
      const maxAttempts = 120; // 2 minutes max wait
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        attempts++;
        
                 try {
           const status = await this.app.checkCrawlStatus(crawlStart.id!) as any;
           console.log(`📊 Crawl status check ${attempts}: ${status.status} (${status.completed || 0}/${status.total || 0})`);
           
           if (status.status === 'completed') {
             const endTime = Date.now();
             console.log('⏱️ Crawl completed in:', endTime - startTime, 'ms');
             
             const crawledPages = status.data || [];
             console.log(`📄 Pages found: ${crawledPages.length}`);
             
             if (crawledPages.length === 0) {
               return {
                 success: false,
                 error: 'No pages were crawled from the website'
               };
             }

             // Log details about crawled pages
             crawledPages.forEach((page, index) => {
               const pageUrl = page.metadata?.sourceURL || page.metadata?.url || 'Unknown URL';
               const title = page.metadata?.title || 'No title';
               console.log(`📑 Page ${index + 1}: ${title} - ${pageUrl}`);
             });

             // Combine all page content into a comprehensive knowledge base
             const combinedContent = this.processCrawledData(crawledPages, url, companyName);
             
             // Create knowledge base in ElevenLabs
             const knowledgeBaseId = await this.createElevenLabsKnowledgeBase(
               combinedContent,
               companyName,
               url,
               crawledPages.length
             );

             return {
               success: true,
               knowledgeBaseId,
               content: combinedContent,
               totalPages: crawledPages.length,
               message: `Successfully crawled ${crawledPages.length} pages and created knowledge base`
             };
             
           } else if (status.status === 'failed') {
             console.error('❌ Crawl failed:', status);
             return {
               success: false,
               error: 'Crawl job failed'
             };
           } else if (status.status === 'cancelled') {
             console.error('❌ Crawl cancelled:', status);
             return {
               success: false,
               error: 'Crawl job was cancelled'
             };
           }
           
           // Continue waiting for scraping/in-progress status
           
         } catch (statusError) {
           console.warn('❌ Status check error:', statusError);
           // Continue trying
         }
      }
      
      console.error('❌ Crawl timed out after 2 minutes');
      return {
        success: false,
        error: 'Crawl timed out after 2 minutes'
      };

    } catch (error) {
      console.error('🚨 Error during website crawl:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during crawl'
      };
    }
  }

  /**
   * Process crawled data into structured content for knowledge base
   */
  private processCrawledData(crawledPages: any[], baseUrl: string, companyName: string): string {
    const processedContent: string[] = [];
    
    // Add header with metadata
    processedContent.push(`# ${companyName} Website Knowledge Base`);
    processedContent.push(`Source: ${baseUrl}`);
    processedContent.push(`Last Updated: ${new Date().toISOString()}`);
    processedContent.push(`Total Pages: ${crawledPages.length}`);
    processedContent.push('---\n');

    // Process each page
    crawledPages.forEach((page, index) => {
      try {
        const pageUrl = page.metadata?.sourceURL || page.metadata?.url || page.url || `Page ${index + 1}`;
        const pageTitle = page.metadata?.title || `Page ${index + 1}`;
        const pageContent = page.markdown || page.content || '';
        
        if (pageContent.trim()) {
          processedContent.push(`## ${pageTitle}`);
          processedContent.push(`URL: ${pageUrl}`);
          
          // Add page metadata if available
          if (page.metadata) {
            if (page.metadata.description) {
              processedContent.push(`Description: ${page.metadata.description}`);
            }
            if (page.metadata.keywords) {
              processedContent.push(`Keywords: ${page.metadata.keywords}`);
            }
            if (page.metadata.statusCode) {
              processedContent.push(`Status: ${page.metadata.statusCode}`);
            }
          }
          
          processedContent.push(''); // Empty line
          processedContent.push(pageContent);
          processedContent.push('\n---\n'); // Page separator
        }
      } catch (error) {
        console.warn(`Error processing page ${index}:`, error);
      }
    });

    return processedContent.join('\n');
  }

  /**
   * Create knowledge base in ElevenLabs from crawled content
   */
  private async createElevenLabsKnowledgeBase(
    content: string, 
    companyName: string, 
    websiteUrl: string,
    pageCount: number
  ): Promise<string> {
    try {
      console.log('Creating ElevenLabs knowledge base from crawled content...');
      
      // Get the API key
      let apiKey = await getElevenLabsApiKey();
      
      // Use environment variable as fallback if not found
      if (!apiKey) {
        console.warn('No API key found for knowledge base creation, trying environment variable');
        apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      }
      
      if (!apiKey) {
        throw new Error('No ElevenLabs API key found for knowledge base creation. Please add your API key in Settings or .env file.');
      }

      const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/text', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
          name: `${companyName} Website (${pageCount} pages) - ${new Date().toLocaleDateString()}`
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to create knowledge base: ${response.status}`;
        
        try {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          
          if (response.status === 401) {
            errorMessage = 'Invalid API key for knowledge base operation.';
          } else if (response.status === 403) {
            errorMessage = 'Access denied for knowledge base operation.';
          } else if (response.status === 422) {
            errorMessage = `Invalid content or parameters: ${errorData.detail?.[0]?.msg || errorText}`;
          } else {
            errorMessage = `Knowledge base API error: ${response.status} - ${errorData.detail || errorText}`;
          }
        } catch (parseError) {
          console.error('Error parsing knowledge base response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Knowledge base created successfully:', result);
      
      // Extract document ID from response
      let documentId = null;
      if (result.id) {
        documentId = result.id;
      } else if (result.document_id) {
        documentId = result.document_id;
      } else if (result.data?.id) {
        documentId = result.data.id;
      } else if (result.data?.document_id) {
        documentId = result.data.document_id;
      } else {
        console.error('Could not find document ID in response. Response structure:', Object.keys(result));
        throw new Error('Knowledge base creation response did not include document ID');
      }
      
      console.log('Extracted knowledge base document ID:', documentId);
      return documentId;

    } catch (error) {
      console.error('Error creating ElevenLabs knowledge base:', error);
      throw error;
    }
  }

  /**
   * Get crawl status (for async crawls)
   */
  async getCrawlStatus(crawlId: string): Promise<any> {
    try {
      return await this.app.checkCrawlStatus(crawlId);
    } catch (error) {
      console.error('Error checking crawl status:', error);
      throw error;
    }
  }

  /**
   * Start async crawl (returns immediately with crawl ID)
   */
  async startAsyncCrawl(url: string, options: CrawlOptions = {}): Promise<{ success: boolean; crawlId?: string; error?: string }> {
    try {
      const crawlParams = {
        limit: options.limit || 50,
        ...(options.maxDepth && { maxDepth: options.maxDepth }),
        ...(options.excludePaths && { excludePaths: options.excludePaths }),
        ...(options.includePaths && { includeOnlyPaths: options.includePaths }),
        ...(options.ignoreSitemap !== undefined && { ignoreSitemap: options.ignoreSitemap }),
        ...(options.allowBackwardLinks !== undefined && { allowBackwardsLinks: options.allowBackwardLinks }),
        scrapeOptions: {
          formats: (options.scrapeOptions?.formats || ['markdown']) as CrawlFormat[],
          onlyMainContent: options.scrapeOptions?.onlyMainContent !== false,
          ...(options.scrapeOptions?.removeBase64Images !== undefined && { removeBase64Images: options.scrapeOptions.removeBase64Images }),
          ...(options.scrapeOptions?.excludeTags && { excludeTags: options.scrapeOptions.excludeTags }),
          ...(options.scrapeOptions?.includeTags && { includeTags: options.scrapeOptions.includeTags }),
          ...(options.scrapeOptions?.waitFor && { waitFor: options.scrapeOptions.waitFor }),
          ...(options.scrapeOptions?.timeout && { timeout: options.scrapeOptions.timeout }),
          ...(options.scrapeOptions?.maxAge && { maxAge: options.scrapeOptions.maxAge })
        }
      };

      console.log('🚀 Starting async crawl with params:', crawlParams);
      
      const result = await this.app.asyncCrawlUrl(url, crawlParams);
      
      console.log('📊 Async crawl response:', result);
      
      if (result.success) {
        return {
          success: true,
          crawlId: result.id
        };
      } else {
        return {
          success: false,
          error: (result as any).error || 'Failed to start crawl'
        };
      }
    } catch (error) {
      console.error('🚨 Error starting async crawl:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const firecrawlService = new FireCrawlService();
export type { CrawlResult, CrawlOptions };
