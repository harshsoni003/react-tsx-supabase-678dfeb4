import { getElevenLabsApiKey } from '@/services/elevenlabs';

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
  prompt: string;
  description?: string;
  voice_id?: string;
  language?: string;
  conversation_config?: {
    agent_prompt: string;
    first_message?: string;
    language?: string;
  };
}

// Interface for ElevenLabs agent creation response
interface ElevenLabsAgentResponse {
  agent_id: string;
  name: string;
  prompt: string;
  description?: string;
  voice_id?: string;
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

// Create a new agent in ElevenLabs
export const createAgent = async (data: AgentCreationData): Promise<string> => {
  try {
    console.log('Creating agent with data:', data);
    
    // Get the API key
    const apiKey = await getElevenLabsApiKey();
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found. Please add your API key in Settings.');
    }

    // Generate agent prompt and configuration
    const agentPrompt = generateAgentPrompt(data);
    const firstMessage = generateFirstMessage(data);

    // Create knowledge base FIRST before agent
    let knowledgeBaseId: string | null = null;
    try {
      console.log('Creating knowledge base document BEFORE agent creation...');
      knowledgeBaseId = await createWebsiteKnowledgeBase(data.websiteUrl, data.companyName);
      console.log('Knowledge base created with ID:', knowledgeBaseId);
      
      // Wait a bit for KB to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.warn('Failed to create knowledge base:', error);
    }

    // Prepare the agent creation request with ALL possible KB structures
    const agentRequest: any = {
      name: data.agentName,
      conversation_config: {
        agent: {
          prompt: {
            prompt: agentPrompt
          },
          first_message: firstMessage,
          language: 'en'
        }
      }
    };

    // Try ALL possible knowledge base inclusion methods if we have a KB ID
    if (knowledgeBaseId) {
      // Method 1: In conversation_config.agent
      agentRequest.conversation_config.agent.knowledge_base = {
        enabled: true,
        document_ids: [knowledgeBaseId]
      };
      
      // Method 2: At root level
      agentRequest.knowledge_base = {
        enabled: true,
        document_ids: [knowledgeBaseId]
      };
      
      // Method 3: Simple document_ids array
      agentRequest.document_ids = [knowledgeBaseId];
      
      // Method 4: In conversation_config directly
      agentRequest.conversation_config.knowledge_base = {
        enabled: true,
        document_ids: [knowledgeBaseId]
      };
    }

    console.log('Agent creation request with KB:', JSON.stringify(agentRequest, null, 2));

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
    
    console.log('Agent created successfully:', result);
    console.log('Checking if knowledge base was included in agent creation...');

    // Verify if KB was included during creation
    if (knowledgeBaseId) {
      console.log('Verifying knowledge base inclusion...');
      
      // Check immediately if KB was included
      try {
        const agentDetails = await getAgentDetails(result.agent_id);
        console.log('Created agent details:', JSON.stringify(agentDetails, null, 2));
        
        // Check all possible KB locations
        const kbLocations = [
          agentDetails?.conversation_config?.agent?.knowledge_base?.document_ids,
          agentDetails?.knowledge_base?.document_ids,
          agentDetails?.agent?.knowledge_base?.document_ids,
          agentDetails?.document_ids,
          agentDetails?.conversation_config?.knowledge_base?.document_ids
        ];
        
        let hasKnowledgeBase = false;
        for (const location of kbLocations) {
          if (Array.isArray(location) && location.includes(knowledgeBaseId)) {
            hasKnowledgeBase = true;
            console.log('✅ SUCCESS! Knowledge base was included during agent creation!');
            console.log('Found KB in:', location);
            break;
          }
        }
        
        if (!hasKnowledgeBase) {
          console.log('❌ Knowledge base not found in created agent, attempting association...');
          
          // Try association methods
          await associateKnowledgeBaseWithAgent(result.agent_id, knowledgeBaseId);
          
          // Final check
          const finalCheck = await getAgentDetails(result.agent_id);
          const finalKbCheck = kbLocations.some(loc => 
            Array.isArray(loc) && loc.includes(knowledgeBaseId)
          );
          
          if (finalKbCheck) {
            console.log('✅ Knowledge base successfully associated after creation!');
          } else {
            console.log('⚠️ IMPORTANT: Knowledge base document created but not auto-associated');
            console.log('📝 Manual association required:');
            console.log(`   1. Go to: https://elevenlabs.io/app/conversational-ai/agents/${result.agent_id}`);
            console.log('   2. Click "Add document" in Knowledge base section');
            console.log('   3. Select your website knowledge document');
            console.log('   4. Enable the RAG toggle');
          }
        }
      } catch (error) {
        console.error('Error verifying knowledge base:', error);
      }
    }

    // Store agent creation data for future reference
    await storeAgentMetadata(result.agent_id, data);

    return result.agent_id;

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
const createWebsiteKnowledgeBase = async (websiteUrl: string, companyName: string): Promise<string> => {
  try {
    console.log(`Creating knowledge base document from website ${websiteUrl}...`);
    
    const apiKey = await getElevenLabsApiKey();
    if (!apiKey) {
      throw new Error('No ElevenLabs API key found for knowledge base creation.');
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

// Associate knowledge base document with an agent - comprehensive approach
const associateKnowledgeBaseWithAgent = async (agentId: string, knowledgeBaseId: string): Promise<void> => {
  try {
    const apiKey = await getElevenLabsApiKey();
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

    // Method 1: PATCH with correct knowledge base structure according to API docs
    const patchPayload = {
      conversation_config: {
        agent: {
          prompt: {
            ...currentAgent.conversation_config?.agent?.prompt,
            knowledge_base: [
              {
                type: "url",
                name: `Knowledge Base Document ${knowledgeBaseId}`,
                id: knowledgeBaseId,
                usage_mode: "prompt"
              }
            ]
          }
        }
      }
    };

    let updateResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchPayload),
    });

    let responseText = await updateResponse.text();

    if (!updateResponse.ok) {
      // Method 2: Try with minimal payload structure
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

      updateResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(minimalPayload),
      });

      responseText = await updateResponse.text();
    }

    if (!updateResponse.ok) {
      // Method 3: Try merging with existing agent config
      const fullMergePayload = {
        name: currentAgent.name,
        conversation_config: {
          ...currentAgent.conversation_config,
          agent: {
            ...currentAgent.conversation_config?.agent,
            prompt: {
              ...currentAgent.conversation_config?.agent?.prompt,
              knowledge_base: [
                {
                  type: "url",
                  name: `Knowledge Base Document ${knowledgeBaseId}`,
                  id: knowledgeBaseId,
                  usage_mode: "prompt"
                }
              ]
            }
          }
        }
      };

      updateResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullMergePayload),
      });

      responseText = await updateResponse.text();
    }

    if (!updateResponse.ok) {
      // Method 4: Try agent-specific knowledge base endpoints
      const endpoints = [
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}/knowledge-base`,
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}/knowledge-base/add`,
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}/documents`,
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}/knowledge-base/${knowledgeBaseId}`
      ];

      for (const endpoint of endpoints) {
        const payloads = [
          { document_ids: [knowledgeBaseId] },
          { document_id: knowledgeBaseId },
          { id: knowledgeBaseId },
          knowledgeBaseId
        ];

        for (const payload of payloads) {
          try {
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            const text = await response.text();

            if (response.ok || response.status === 201) {
              updateResponse = response;
              responseText = text;
              break;
            }
          } catch (e) {
            // Continue to next payload
          }
        }

        if (updateResponse.ok) break;
      }
    }

    // Final verification
    await new Promise(resolve => setTimeout(resolve, 2000));

    const verifyResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (verifyResponse.ok) {
      const verifiedAgent = await verifyResponse.json();

      // Check all possible locations for knowledge base
      const possiblePaths = [
        verifiedAgent.conversation_config?.agent?.prompt?.knowledge_base,
        verifiedAgent.conversation_config?.agent?.knowledge_base?.document_ids,
        verifiedAgent.knowledge_base?.document_ids,
        verifiedAgent.agent?.knowledge_base?.document_ids,
        verifiedAgent.documents,
        verifiedAgent.knowledge_base
      ];

      for (const path of possiblePaths) {
        if (Array.isArray(path)) {
          const hasKnowledge = path.some(item => 
            (typeof item === 'string' && item === knowledgeBaseId) ||
            (typeof item === 'object' && item.id === knowledgeBaseId)
          );
          if (hasKnowledge) {
            return;
          }
        }
      }
    }

    // If we reach here, automatic association failed
    throw new Error('Knowledge base association could not be automatically completed. You may need to manually associate it in the ElevenLabs dashboard.');

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

    const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/documents', {
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