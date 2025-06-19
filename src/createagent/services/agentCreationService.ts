import { getElevenLabsApiKey } from '@/services/elevenlabs';
import { firecrawlService } from '@/services/firecrawlService';
import { generateSimpleAgentPrompt, generateSimpleFirstMessage, generateSimpleCompanyInfo } from './standardPromptGenerator';
import { DEFAULT_AGENT_ID } from '@/constants/agentConstants';

// Interface for agent creation data
export interface AgentCreationData {
  email: string;
  companyName: string;
  websiteUrl: string;
  agentName: string;
  useFire1Extraction?: boolean;
}

// Interface for extracted company information from FIRE-1 agent
export interface CompanyInformation {
  companyName: string;
  companyIndustryType?: string;
  companySummary?: string;
  companyServices?: Array<{
    service: string;
    description: string;
  }>;
  companyPricings?: Array<{
    plan: string;
    price: string;
    features: string;
  }>;
  companyEmail?: string;
  companyFAQ?: Array<{
    question: string;
    answer: string;
  }>;
  companySocials?: {
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    other_socials?: string;
  };
  valueProposition?: string;
  problemSolving?: string;
  companySolution?: string;
  companyCTA?: string;
  additionalInfo?: string;
}

// Interface for ElevenLabs agent creation request
interface ElevenLabsAgentRequest {
  name: string;
  conversation_config: {
    agent: {
      prompt: {
        prompt: string;
        knowledge_base?: Array<{
          type: string;
          name: string;
          id: string;
          usage_mode: string;
        }>;
        rag?: {
          enabled: boolean;
          embedding_model?: string;
          max_documents_length?: number;
        };
      };
      first_message: string;
      language: string;
    };
    tts: {
      voice_id: string;
      voice_settings: {
        stability: number;
        similarity_boost: number;
        style: number;
        use_speaker_boost: boolean;
      };
    };
  };
}

// Interface for ElevenLabs agent creation response
interface ElevenLabsAgentResponse {
  agent_id: string;
  name: string;
  conversation_config?: any;
  created_at: string;
  updated_at: string;
}



// Generate a comprehensive agent prompt based on company data and extracted information (for FIRE-1)
const generateAgentPrompt = (data: AgentCreationData, companyInfo: CompanyInformation): string => {
  return `You are an expert extraction algorithm.
Only extract relevant information from the text.
If you don't know anything then just add "{use your Agent knowledge base to find the information}". Do not make-up them yourself, do not hallucinate.

Your task is to extract company information in below format:

FORMAT:
[Company Information]
#Company Name: ${companyInfo.companyName}
#Company Industry Type: ${companyInfo.companyIndustryType || "Couldn't be Found in Website"}
#Company Summary: ${companyInfo.companySummary || "Couldn't be Found in Website"}
#Company Services Provided: 
${companyInfo.companyServices && companyInfo.companyServices.length > 0 
  ? companyInfo.companyServices.map((service, index) => `${index + 1}. ${service.service}: ${service.description}`).join('\n')
  : "Couldn't be Found in Website"}
#Company Pricings:
${companyInfo.companyPricings && companyInfo.companyPricings.length > 0
  ? "Pricings and Package information:\n" + companyInfo.companyPricings.map((pricing, index) => `${index + 1}. ${pricing.plan}: ${pricing.price}`).join('\n')
  : "Couldn't be Found in Website"}
#Company Email and contact details: ${companyInfo.companyEmail || "Couldn't be Found in Website"}
#Company FAQ:
${companyInfo.companyFAQ && companyInfo.companyFAQ.length > 0
  ? "FAQ questions & their answers:\n" + companyInfo.companyFAQ.map((faq, index) => `${index + 1}.${faq.question}\n  ${index + 1}.${faq.answer}`).join('\n')
  : "Couldn't be Found in Website"}
#All Company Socials accounts username or links(if given):
${companyInfo.companySocials 
  ? ` -YT: ${companyInfo.companySocials.youtube || "Couldn't be Found in Website"}
 -X(twitter): ${companyInfo.companySocials.twitter || "Couldn't be Found in Website"}
 -LinkedIn: ${companyInfo.companySocials.linkedin || "Couldn't be Found in Website"}
 -Instagram: ${companyInfo.companySocials.instagram || "Couldn't be Found in Website"}
 -Other socials: ${companyInfo.companySocials.other_socials || "Couldn't be Found in Website"}`
  : "Couldn't be Found in Website"}
# Other IMP Company Information: ${companyInfo.additionalInfo || "Couldn't be Found in Website"}
#Value proposition: ${companyInfo.valueProposition || "I help you build voice AI for your business."}
#Problem Company is solving: ${companyInfo.problemSolving || "Couldn't be Found in Website"}
#Company Solution to the problem: ${companyInfo.companySolution || "Couldn't be Found in Website"}
#Company CTA: ${companyInfo.companyCTA || "Couldn't be Found in Website"}`;
};

// Extract company information from FIRE-1 agent data
const extractCompanyInformationFromFIRE1 = (fire1Data: any): CompanyInformation => {
  console.log('📊 Processing FIRE-1 extraction data...');
  
  // Handle both array and direct object responses
  const dataArray = Array.isArray(fire1Data) ? fire1Data : [fire1Data];
  const extractedData = dataArray[0] || {};
  
  const companyInfo: CompanyInformation = {
    companyName: extractedData['Company Name'] || 'Unknown Company',
    companyIndustryType: extractedData['Company Industry Type'],
    companySummary: extractedData['Company Summary'],
    companyServices: extractedData['Company Services Provided'],
    companyPricings: extractedData['Company Pricings'],
    companyEmail: extractedData['Company Email and contact details'],
    companyFAQ: extractedData['Company FAQ'],
    companySocials: extractedData['Company Socials accounts'],
    valueProposition: extractedData['Value proposition'],
    problemSolving: extractedData['Problem Company is solving'],
    companySolution: extractedData['Company Solution to the problem'],
    companyCTA: extractedData['Company CTA'],
    additionalInfo: extractedData['Other IMP Company Information']
  };

  console.log('✅ Company information extracted:', companyInfo);
  return companyInfo;
};

// Generate a default first message for the agent
const generateFirstMessage = (data: AgentCreationData, companyInfo: CompanyInformation): string => {
  const valueProposition = companyInfo.valueProposition || "I help you build voice AI for your business.";
  return `Hi! I'm Sarah from ${data.companyName}. ${valueProposition}`;
};



// Create knowledge base document from scraped website content
const createKnowledgeBaseFromContent = async (content: string, companyName: string, websiteUrl: string, contentType: string = 'Website Content'): Promise<string> => {
  try {
    console.log(`Creating knowledge base document from ${contentType.toLowerCase()}...`);
    
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
        name: `${companyName} ${contentType} - ${new Date().toLocaleDateString()}`
      }),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create knowledge base document: ${response.status}`;
      
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
    console.log('Knowledge base document created successfully:', result);
    
    // Log the full response to debug the structure
    console.log('Full knowledge base creation response:', JSON.stringify(result, null, 2));
    
    // The API should return an ID for the created document
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
    console.error('Error creating knowledge base document:', error);
    throw error;
  }
};

// Create a new agent in ElevenLabs with FIRE-1 extracted company information
export const createAgent = async (data: AgentCreationData): Promise<string> => {
  try {
    console.log('Creating agent with data:', data);
    
    // Get the API key
    let apiKey = await getElevenLabsApiKey();
    
    // Use environment variable as fallback if not found
    if (!apiKey) {
      console.warn('No API key found from getElevenLabsApiKey, trying environment variable');
      apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    }
    
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found. Please add your API key in Settings or .env file.');
    }

    // Enhanced knowledge base creation: Both scraped content AND URL-based knowledge
    let scrapedContentKnowledgeBaseId: string | null = null;
    let urlBasedKnowledgeBaseId: string | null = null;
    let companyInfo: CompanyInformation = { companyName: data.companyName };
    
    console.log('🚀 Starting dual knowledge base creation (Scraped Content + URL-based)...');
    
    // 1. Conditional FIRE-1 Agent extraction for comprehensive scraped data
    if (data.useFire1Extraction !== false) { // Default to true if not specified
      console.log('🤖 Step 1: Extracting company information using FIRE-1 agent...');
      try {
        const fire1Result = await firecrawlService.extractCompanyInformationWithFIRE1(data.websiteUrl);
        
        if (fire1Result.success && fire1Result.data) {
          // Extract company information from FIRE-1 structured data
          companyInfo = extractCompanyInformationFromFIRE1(fire1Result.data);
          console.log('✅ Company information extracted successfully via FIRE-1');
          
          // Create knowledge base from FIRE-1 formatted content
          if (fire1Result.content) {
            console.log('📄 Creating scraped content knowledge base from FIRE-1 extracted content...');
            scrapedContentKnowledgeBaseId = await createKnowledgeBaseFromContent(
              fire1Result.content,
              companyInfo.companyName,
              data.websiteUrl,
              'FIRE-1 Extracted Content'
            );
            console.log('✅ FIRE-1 scraped content knowledge base created with ID:', scrapedContentKnowledgeBaseId);
          }
        } else {
          console.warn('⚠️ FIRE-1 extraction failed:', fire1Result.error);
        }
      } catch (fire1Error) {
        console.error('❌ FIRE-1 extraction error:', fire1Error);
      }
    } else {
      console.log('⏭️ Step 1: Skipping FIRE-1 extraction (disabled by user)');
    }

    // 2. Fallback to standard scraping if FIRE-1 didn't provide scraped content
    if (!scrapedContentKnowledgeBaseId) {
      console.log('🔄 Step 2: Fallback to standard website scraping for content...');
      try {
        const scrapeResult = await firecrawlService.scrapeWebsite(data.websiteUrl);
        if (scrapeResult.success && scrapeResult.content) {
          scrapedContentKnowledgeBaseId = await createKnowledgeBaseFromContent(
            scrapeResult.content,
            data.companyName,
            data.websiteUrl,
            'Scraped Website Content'
          );
          console.log('✅ Fallback scraped content knowledge base created with ID:', scrapedContentKnowledgeBaseId);
        }
      } catch (scrapeError) {
        console.error('❌ Fallback scraping error:', scrapeError);
      }
    }

    // 3. Always create URL-based knowledge base (in addition to scraped content)
    console.log('🌐 Step 3: Creating URL-based knowledge base...');
    try {
      urlBasedKnowledgeBaseId = await createWebsiteKnowledgeBase(
        data.websiteUrl,
        data.companyName
      );
      console.log('✅ URL-based knowledge base created with ID:', urlBasedKnowledgeBaseId);
    } catch (urlError) {
      console.error('❌ URL-based knowledge base creation failed:', urlError);
    }

    // Log the knowledge base creation results
    console.log('📊 Knowledge base creation summary:', {
      scrapedContentKB: scrapedContentKnowledgeBaseId ? '✅ Created' : '❌ Failed',
      urlBasedKB: urlBasedKnowledgeBaseId ? '✅ Created' : '❌ Failed',
      totalKnowledgeBases: [scrapedContentKnowledgeBaseId, urlBasedKnowledgeBaseId].filter(Boolean).length
    });

    // Generate agent prompt based on extraction method used
    const useFire1 = data.useFire1Extraction !== false;
    console.log(`🎯 Generating ${useFire1 ? 'comprehensive FIRE-1' : 'simple'} agent prompt...`);
    
    const agentPrompt = useFire1 
      ? generateAgentPrompt(data, companyInfo) 
      : generateSimpleAgentPrompt(data);
    const firstMessage = useFire1
      ? generateFirstMessage(data, companyInfo)
      : generateSimpleFirstMessage(data);
      
    console.log('📝 Agent prompt preview:', agentPrompt.substring(0, 200) + '...');

    // Prepare knowledge base array with both scraped content and URL-based knowledge
    const knowledgeBaseArray: Array<{
      type: string;
      name: string;
      id: string;
      usage_mode: string;
    }> = [];

    // Add scraped content knowledge base if available
    if (scrapedContentKnowledgeBaseId) {
      knowledgeBaseArray.push({
        type: "text",
        name: `${data.companyName} Scraped Content`,
        id: scrapedContentKnowledgeBaseId,
        usage_mode: "auto" // Use auto mode which enables RAG functionality
      });
    }

    // Add URL-based knowledge base if available
    if (urlBasedKnowledgeBaseId) {
      knowledgeBaseArray.push({
        type: "url",
        name: `${data.companyName} Website Knowledge`,
        id: urlBasedKnowledgeBaseId,
        usage_mode: "auto" // Use auto mode which enables RAG functionality
      });
    }

    // Prepare the agent creation request
    const agentRequest: ElevenLabsAgentRequest = {
      name: data.agentName,
      conversation_config: {
        agent: {
          prompt: {
            prompt: agentPrompt,
            // Include both knowledge bases if we have any
            ...(knowledgeBaseArray.length > 0 && {
              knowledge_base: knowledgeBaseArray
            }),
            // Always enable RAG when we have knowledge bases
            ...(knowledgeBaseArray.length > 0 && {
              rag: {
                enabled: true,
                embedding_model: "e5_mistral_7b_instruct",
                max_documents_length: 15000 // Increased limit for multiple knowledge bases
              }
            })
          },
          first_message: firstMessage,
          language: 'en'
        },
        tts: {
          voice_id: 'EXAVITQu4vr4xnSDxMaL', // Sarah's voice ID
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }
      }
    };

    console.log('Agent creation request:', JSON.stringify(agentRequest, null, 2));
    console.log('Sending agent creation request to ElevenLabs...');

    // Make the API request to create the agent
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentRequest),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create agent: ${response.status}`;
      
      try {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        
        if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your ElevenLabs API key in Settings.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Please check your ElevenLabs subscription and API key permissions.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (response.status === 422) {
          errorMessage = `Invalid request: ${errorData.detail?.[0]?.msg || errorText}`;
        } else {
          errorMessage = `ElevenLabs API error: ${response.status} - ${errorData.detail || errorText}`;
        }
      } catch (parseError) {
        errorMessage = `ElevenLabs API error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const result: ElevenLabsAgentResponse = await response.json();
    const agentId = result.agent_id;
    
    console.log('Agent created successfully with ID:', agentId);
    
    // Store agent creation data for future reference
    await storeAgentMetadata(agentId, data);

    return agentId;

  } catch (error) {
    console.error('Error creating agent:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred while creating the agent.');
    }
  }
};

// Create a knowledge base document from website URL and return its ID
export const createWebsiteKnowledgeBase = async (websiteUrl: string, companyName: string): Promise<string> => {
  try {
    console.log(`Creating knowledge base document from website ${websiteUrl}...`);
    
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

    const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/url', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        name: `${companyName} Website Knowledge`
      }),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create knowledge base document: ${response.status}`;
      
      try {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        
        if (response.status === 401) {
          errorMessage = 'Invalid API key for knowledge base operation.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied for knowledge base operation.';
        } else if (response.status === 422) {
          errorMessage = `Invalid URL or parameters: ${errorData.detail?.[0]?.msg || errorText}`;
        } else {
          errorMessage = `Knowledge base API error: ${response.status} - ${errorData.detail || errorText}`;
        }
      } catch (parseError) {
        console.error('Error parsing knowledge base response:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Knowledge base document created successfully:', result);
    
    // Log the full response to debug the structure
    console.log('Full knowledge base creation response:', JSON.stringify(result, null, 2));
    
    // The API should return an ID for the created document
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
    console.error('Error creating knowledge base document:', error);
    throw error;
  }
};

// Associate knowledge base document with an agent using the correct API structure
export const associateKnowledgeBaseWithAgent = async (agentId: string, knowledgeBaseId: string): Promise<void> => {
  try {
    // Get the API key
    let apiKey = await getElevenLabsApiKey();
    
    if (!apiKey) {
      console.warn('No API key found for knowledge base association, trying environment variable');
      apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    }
    
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found for knowledge base association.');
    }

    console.log(`Attempting to associate knowledge base document ${knowledgeBaseId} with agent ${agentId}...`);

    // First get the current agent configuration
    const getResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to get agent details: ${getResponse.status}`);
    }

    const currentAgent = await getResponse.json();
    
    // Update the agent with proper knowledge base structure in prompt configuration
    const updatedAgent = {
      ...currentAgent,
      conversation_config: {
        ...currentAgent.conversation_config,
        agent: {
          ...currentAgent.conversation_config?.agent,
          prompt: {
            ...currentAgent.conversation_config?.agent?.prompt,
            knowledge_base: [
              {
                type: "url",
                name: `Knowledge Base Document`,
                id: knowledgeBaseId,
                usage_mode: "prompt"
              }
            ]
          }
        }
      }
    };

    const updateResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedAgent),
    });

    if (updateResponse.ok) {
      console.log('✅ Successfully associated knowledge base document with agent!');
      return;
    }
    
    // If the full update failed, try with minimal payload
    console.log(`Full update method failed (${updateResponse.status}). Trying minimal update...`);
    
    const minimalPayload = {
      conversation_config: {
        agent: {
          prompt: {
            knowledge_base: [
              {
                type: "url",
                id: knowledgeBaseId,
                usage_mode: "prompt"
              }
            ]
          }
        }
      }
    };

    const minimalResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalPayload),
    });

    if (minimalResponse.ok) {
      console.log('✅ Successfully associated knowledge base document with agent using minimal update!');
      return;
    }

    // If we reach here, automatic association failed
    console.error(`❌ All automatic association methods failed. Status codes: Update: ${updateResponse.status}, Minimal: ${minimalResponse.status}`);
    console.log('⚠️ Please manually associate the knowledge base document with the agent through the ElevenLabs dashboard:');
    console.log(`1. Go to: https://elevenlabs.io/app/conversational-ai/agents/${agentId}`);
    console.log('2. Click "Add document" in Knowledge base section');
    console.log('3. Select your website knowledge document');
    console.log('4. Enable the RAG toggle');
    
    throw new Error('Knowledge base association could not be automatically completed. Manual association may be required.');

  } catch (error) {
    console.error('❌ Error in knowledge base association:', error);
    throw error;
  }
};

// Add website URL to agent's knowledge base
const addWebsiteToKnowledgeBase = async (agentId: string, websiteUrl: string, companyName: string): Promise<void> => {
  try {
    console.log(`Adding website ${websiteUrl} to knowledge base for agent ${agentId}...`);
    
    const apiKey = await getElevenLabsApiKey();
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found for knowledge base update.');
    }

    const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/url', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        name: `${companyName} Website Knowledge`
      }),
    });

    if (!response.ok) {
      let errorMessage = `Failed to add website to knowledge base: ${response.status}`;
      
      try {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        
        if (response.status === 401) {
          errorMessage = 'Invalid API key for knowledge base operation.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied for knowledge base operation.';
        } else if (response.status === 422) {
          errorMessage = `Invalid URL or parameters: ${errorData.detail?.[0]?.msg || errorText}`;
        } else {
          errorMessage = `Knowledge base API error: ${response.status} - ${errorData.detail || errorText}`;
        }
      } catch (parseError) {
        errorMessage = `Knowledge base API error: ${response.status} ${response.statusText}`;
      }
      
      // Log the error but don't throw it - knowledge base addition shouldn't break agent creation
      console.error('Error adding website to knowledge base:', errorMessage);
      return;
    }

    const result = await response.json();
    console.log('Website added to knowledge base successfully:', result);

  } catch (error) {
    console.error('Error adding website to knowledge base:', error);
    // Don't throw error - knowledge base addition is supplementary
  }
};

// Store agent metadata for future reference
const storeAgentMetadata = async (agentId: string, data: AgentCreationData): Promise<void> => {
  try {
    // Here you could store the agent metadata in your database
    // For now, we'll just log it
    const metadata = {
      agent_id: agentId,
      company_name: data.companyName,
      contact_email: data.email,
      website_url: data.websiteUrl,
      agent_name: data.agentName,
      created_at: new Date().toISOString(),
    };

    console.log('Agent metadata:', metadata);
    
    // TODO: If you have a database, store this metadata there
    // Example: await supabase.from('agents').insert(metadata);
    
  } catch (error) {
    console.error('Error storing agent metadata:', error);
    // Don't throw error for metadata storage failure
  }
};

// Get agent details from ElevenLabs
export const getAgentDetails = async (agentId: string) => {
  try {
    const apiKey = await getElevenLabsApiKey();
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found.');
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agent details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching agent details:', error);
    throw error;
  }
};

// List all agents
export const listAgents = async () => {
  try {
    const apiKey = await getElevenLabsApiKey();
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found.');
    }

    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/get-all', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

// Update agent configuration
export const updateAgent = async (agentId: string, updates: Partial<ElevenLabsAgentRequest>) => {
  try {
    const apiKey = await getElevenLabsApiKey();
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found.');
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update agent: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating agent:', error);
    throw error;
  }
};

// Delete agent
export const deleteAgent = async (agentId: string) => {
  try {
    const apiKey = await getElevenLabsApiKey();
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found.');
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete agent: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw error;
  }
};

// Add website URL to knowledge base (can be used separately)
export const addWebsiteToAgentKnowledgeBase = async (websiteUrl: string, companyName?: string) => {
  try {
    const apiKey = await getElevenLabsApiKey();
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found.');
    }

    const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/url', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        name: companyName ? `${companyName} Website Knowledge` : 'Website Knowledge'
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add website to knowledge base: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding website to knowledge base:', error);
    throw error;
  }
};

// Get all knowledge base documents
export const getKnowledgeBaseDocuments = async () => {
  try {
    const apiKey = await getElevenLabsApiKey();
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found.');
    }

    const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch knowledge base documents: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching knowledge base documents:', error);
    throw error;
  }
};

// Associate an existing knowledge base document with an agent
export const associateExistingKnowledgeBase = async (agentId: string, knowledgeBaseId: string, knowledgeBaseName?: string): Promise<void> => {
  try {
    console.log(`Associating existing knowledge base ${knowledgeBaseId} with agent ${agentId}...`);
    
    // Get the API key
    let apiKey = await getElevenLabsApiKey();
    
    if (!apiKey) {
      console.warn('No API key found for knowledge base association, trying environment variable');
      apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    }
    
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found for knowledge base association.');
    }

    // First get the current agent configuration
    const getResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to get agent details: ${getResponse.status}`);
    }

    const currentAgent = await getResponse.json();
    
    // Get existing knowledge base array or create new one
    const existingKnowledgeBase = currentAgent?.conversation_config?.agent?.prompt?.knowledge_base || [];
    
    // Check if this knowledge base is already associated
    const isAlreadyAssociated = existingKnowledgeBase.some((kb: any) => kb.id === knowledgeBaseId);
    
    if (isAlreadyAssociated) {
      console.log('Knowledge base is already associated with this agent.');
      return;
    }
    
    // Add the new knowledge base to the existing array
    const updatedKnowledgeBase = [
      ...existingKnowledgeBase,
      {
        type: "url",
        name: knowledgeBaseName || `Knowledge Base Document`,
        id: knowledgeBaseId,
        usage_mode: "prompt"
      }
    ];
    
    // Update the agent with the new knowledge base
    const updatedAgent = {
      ...currentAgent,
      conversation_config: {
        ...currentAgent.conversation_config,
        agent: {
          ...currentAgent.conversation_config?.agent,
          prompt: {
            ...currentAgent.conversation_config?.agent?.prompt,
            knowledge_base: updatedKnowledgeBase
          }
        }
      }
    };

    const updateResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedAgent),
    });

    if (updateResponse.ok) {
      console.log('✅ Successfully associated existing knowledge base document with agent!');
      return;
    } else {
      const errorText = await updateResponse.text();
      console.error(`Failed to associate knowledge base: ${updateResponse.status} - ${errorText}`);
      throw new Error(`Failed to associate knowledge base: ${updateResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Error associating existing knowledge base:', error);
    throw error;
  }
};

// Remove a knowledge base document from an agent
export const removeKnowledgeBaseFromAgent = async (agentId: string, knowledgeBaseId: string): Promise<void> => {
  try {
    console.log(`Removing knowledge base ${knowledgeBaseId} from agent ${agentId}...`);
    
    // Get the API key
    let apiKey = await getElevenLabsApiKey();
    
    if (!apiKey) {
      console.warn('No API key found for knowledge base removal, trying environment variable');
      apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    }
    
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found for knowledge base removal.');
    }

    // First get the current agent configuration
    const getResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to get agent details: ${getResponse.status}`);
    }

    const currentAgent = await getResponse.json();
    
    // Get existing knowledge base array and filter out the one to remove
    const existingKnowledgeBase = currentAgent?.conversation_config?.agent?.prompt?.knowledge_base || [];
    const updatedKnowledgeBase = existingKnowledgeBase.filter((kb: any) => kb.id !== knowledgeBaseId);
    
    // Update the agent with the filtered knowledge base array
    const updatedAgent = {
      ...currentAgent,
      conversation_config: {
        ...currentAgent.conversation_config,
        agent: {
          ...currentAgent.conversation_config?.agent,
          prompt: {
            ...currentAgent.conversation_config?.agent?.prompt,
            knowledge_base: updatedKnowledgeBase
          }
        }
      }
    };

    const updateResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedAgent),
    });

    if (updateResponse.ok) {
      console.log('✅ Successfully removed knowledge base document from agent!');
      return;
    } else {
      const errorText = await updateResponse.text();
      console.error(`Failed to remove knowledge base: ${updateResponse.status} - ${errorText}`);
      throw new Error(`Failed to remove knowledge base: ${updateResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Error removing knowledge base from agent:', error);
    throw error;
  }
};

// Update an existing agent's voice to use Sarah's voice
export const updateAgentVoice = async (agentId: string): Promise<void> => {
  try {
    console.log(`Updating agent ${agentId} voice to Sarah...`);
    
    const apiKey = await getElevenLabsApiKey();
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found.');
    }

    // Get current agent configuration
    const currentAgent = await getAgentDetails(agentId);
    
    // Update with Sarah's voice configuration
    const voiceUpdate = {
      conversation_config: {
        ...currentAgent.conversation_config,
        agent: {
          ...currentAgent.conversation_config?.agent
        },
        tts: {
          voice_id: 'EXAVITQu4vr4xnSDxMaL', // Sarah's voice ID
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }
      }
    };

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voiceUpdate),
    });

    if (!response.ok) {
      throw new Error(`Failed to update agent voice: ${response.status}`);
    }

    console.log('✅ Agent voice updated to Sarah successfully!');
    return await response.json();
  } catch (error) {
    console.error('Error updating agent voice:', error);
    throw error;
  }
};