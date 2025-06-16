import { getElevenLabsApiKey } from '@/services/elevenlabs';
import { firecrawlService } from '@/services/firecrawlService';

// Interface for agent creation data
export interface AgentCreationData {
  email: string;
  companyName: string;
  websiteUrl: string;
  agentName: string;
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

// Generate a comprehensive agent prompt based on company data
const generateAgentPrompt = (data: AgentCreationData): string => {
  return `You are ${data.agentName}, a professional AI assistant representing ${data.companyName}.

COMPANY INFORMATION:
- Company: ${data.companyName}
- Website: ${data.websiteUrl}
- Contact Email: ${data.email}

YOUR ROLE:
You are a helpful, professional, and knowledgeable customer service representative for ${data.companyName}. Your primary goals are to:

1. Assist customers with inquiries about our products and services
2. Provide accurate information about our company
3. Help resolve customer issues and concerns
4. Guide customers to appropriate resources on our website (${data.websiteUrl})
5. Collect contact information when appropriate
6. Maintain a friendly and professional tone at all times

GUIDELINES:
- Always be polite, helpful, and professional
- If you don't know specific information about the company's products or services, direct customers to visit ${data.websiteUrl} or contact ${data.email}
- Keep responses concise but informative
- Ask clarifying questions when needed
- Always try to be helpful and solution-oriented
- If a customer needs technical support or detailed information you cannot provide, offer to have someone contact them at ${data.email}

GREETING:
Start conversations by introducing yourself: "Hello! I'm ${data.agentName}, your AI assistant from ${data.companyName}. How can I help you today?"

Remember: You represent ${data.companyName} and should always maintain the company's professional standards and values.`;
};

// Generate a default first message for the agent
const generateFirstMessage = (data: AgentCreationData): string => {
  return `Hello! I'm ${data.agentName}, your AI assistant from ${data.companyName}. How can I help you today?`;
};

// Create knowledge base document from scraped website content
const createKnowledgeBaseFromContent = async (content: string, companyName: string, websiteUrl: string): Promise<string> => {
  try {
    console.log('Creating knowledge base document from scraped content...');
    
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
        name: `${companyName} Website Content`
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

// Create a new agent in ElevenLabs with scraped website content
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

    // Generate agent prompt and configuration
    const agentPrompt = generateAgentPrompt(data);
    const firstMessage = generateFirstMessage(data);

    // First, scrape the website content using FireCrawl
    console.log('Scraping website content with FireCrawl...');
    const scrapeResult = await firecrawlService.scrapeWebsite(data.websiteUrl);
    
    let knowledgeBaseId: string | null = null;
    
    if (scrapeResult.success && scrapeResult.content) {
      try {
        console.log('Creating knowledge base from scraped content...');
        knowledgeBaseId = await createKnowledgeBaseFromContent(
          scrapeResult.content, 
          data.companyName, 
          data.websiteUrl
        );
        console.log('Knowledge base created with ID:', knowledgeBaseId);
        
        // Wait a bit for KB to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.warn('Failed to create knowledge base from scraped content:', error);
        
        // Fallback to URL-based knowledge base
        try {
          console.log('Trying URL-based knowledge base as fallback...');
          knowledgeBaseId = await createWebsiteKnowledgeBase(
            data.websiteUrl,
            data.companyName
          );
          console.log('URL-based knowledge base created with ID:', knowledgeBaseId);
          
          // Wait a bit for KB to be fully initialized
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (kbError) {
          console.error('Failed to create URL-based knowledge base as fallback:', kbError);
        }
      }
    } else {
      console.warn('Failed to scrape website content:', scrapeResult.error);
      
      // Fallback to URL-based knowledge base
      try {
        console.log('Trying URL-based knowledge base as primary method...');
        knowledgeBaseId = await createWebsiteKnowledgeBase(
          data.websiteUrl,
          data.companyName
        );
        console.log('URL-based knowledge base created with ID:', knowledgeBaseId);
        
        // Wait a bit for KB to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (kbError) {
        console.error('Failed to create URL-based knowledge base:', kbError);
      }
    }

    // Prepare the agent creation request with proper knowledge base structure
    const agentRequest: ElevenLabsAgentRequest = {
      name: data.agentName,
      conversation_config: {
        agent: {
          prompt: {
            prompt: agentPrompt,
            // Include knowledge base in the prompt configuration if we have one (use auto mode for RAG)
            ...(knowledgeBaseId && {
              knowledge_base: [
                {
                  type: "url",
                  name: `${data.companyName} Website Knowledge`,
                  id: knowledgeBaseId,
                  usage_mode: "auto" // Use auto mode which enables RAG functionality
                }
              ]
            }),
            // Always enable RAG when we have a knowledge base
            ...(knowledgeBaseId && {
              rag: {
                enabled: true,
                embedding_model: "e5_mistral_7b_instruct", // Default embedding model
                max_documents_length: 10000 // Maximum document length for RAG
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
    
    // Verify the knowledge base was included in the agent creation
    if (knowledgeBaseId) {
      console.log('Verifying knowledge base association...');
      try {
        const agentDetails = await getAgentDetails(agentId);
        console.log('Created agent details:', JSON.stringify(agentDetails, null, 2));
        
        // Check if knowledge base was included in the prompt configuration
        const hasKnowledgeBase = agentDetails?.conversation_config?.agent?.prompt?.knowledge_base?.some(
          (kb: any) => kb.id === knowledgeBaseId
        );
        
        if (hasKnowledgeBase) {
          console.log('✅ SUCCESS! Knowledge base was included during agent creation!');
        } else {
          console.log('❌ Knowledge base not found in created agent, attempting association...');
          
          // Try association as fallback
          await associateKnowledgeBaseWithAgent(agentId, knowledgeBaseId);
          
          // Final verification
          const finalCheck = await getAgentDetails(agentId);
          const finalHasKnowledgeBase = finalCheck?.conversation_config?.agent?.prompt?.knowledge_base?.some(
            (kb: any) => kb.id === knowledgeBaseId
          );
          
          if (finalHasKnowledgeBase) {
            console.log('✅ Knowledge base successfully associated after creation!');
          } else {
            console.log('⚠️ IMPORTANT: Knowledge base document created but not auto-associated');
            console.log('📝 Manual association required:');
            console.log(`   1. Go to: https://elevenlabs.io/app/conversational-ai/agents/${agentId}`);
            console.log('   2. Click "Add document" in Knowledge base section');
            console.log('   3. Select your website knowledge document');
            console.log('   4. Enable the RAG toggle');
          }
        }
      } catch (error) {
        console.error('Error verifying knowledge base:', error);
      }
    } else {
      console.log('No knowledge base was created, skipping association.');
    }

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
