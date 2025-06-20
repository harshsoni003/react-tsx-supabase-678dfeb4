import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Globe, 
  Building2,
  MessageCircle,
  Loader2,
  ExternalLink,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Cpu
} from 'lucide-react';
import { 
  getAgentDetails, 
  associateKnowledgeBaseWithAgent,
  createWebsiteKnowledgeBase,
  updateAgentVoice,
  updateAgentLLM,
  getAvailableLLMModels,
  getSuccessfulModelFormat
} from '../createagent/services/agentCreationService';
import { getElevenLabsApiKey } from '../services/elevenlabs';
import { supabase } from '@/integrations/supabase/client';
import WebsiteIframe from '@/components/ui/WebsiteIframe';

interface AgentDetails {
  agent_id: string;
  name: string;
  conversation_config?: {
    agent?: {
      prompt?: {
        prompt: string;
        knowledge_base?: Array<{
          type: string;
          name?: string;
          id: string;
          usage_mode: string;
        }>;
      };
      first_message?: string;
      language?: string;
      knowledge_base?: {
        enabled?: boolean;
        document_ids?: string[];
      };
    };
    knowledge_base?: {
      enabled?: boolean;
      document_ids?: string[];
    };
  };
  agent?: {
    prompt?: {
      prompt: string;
      knowledge_base?: Array<{
        type: string;
        name?: string;
        id: string;
        usage_mode: string;
      }>;
    };
    first_message?: string;
    language?: string;
    knowledge_base?: {
      enabled?: boolean;
      document_ids?: string[];
    };
  };
  knowledge_base?: {
    enabled?: boolean;
    document_ids?: string[];
  };
  prompt?: {
    prompt: string;
  } | string;
  first_message?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
}

interface CreatedAgentData {
  agentId: string;
  agentName: string;
  companyName: string;
  websiteUrl: string;
  email: string;
}

const AgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get state passed from navigation, if available
  const createdAgent = location.state?.agent as CreatedAgentData || null;
  
  // Local state
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const [localAgent, setLocalAgent] = useState<CreatedAgentData | null>(createdAgent);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [micPermissionRequested, setMicPermissionRequested] = useState(false);
  const [hasKnowledgeBase, setHasKnowledgeBase] = useState<boolean | null>(null);
  const [loadingAssociation, setLoadingAssociation] = useState(false);
  const [loadingVoiceUpdate, setLoadingVoiceUpdate] = useState(false);
  const [loadingLLM, setLoadingLLM] = useState(false);
  const [isVisitAllowed, setIsVisitAllowed] = useState<boolean | null>(null);
  const [visitStats, setVisitStats] = useState<any>(null);
  const [isCheckingVisit, setIsCheckingVisit] = useState(true);

  // Helper to check if agent has knowledge base and get details
  const checkKnowledgeBase = (details: AgentDetails): boolean => {
    // Check the new structure: conversation_config.agent.prompt.knowledge_base array
    const promptKnowledgeBase = details?.conversation_config?.agent?.prompt?.knowledge_base;
    if (Array.isArray(promptKnowledgeBase) && promptKnowledgeBase.length > 0) {
      return true;
    }
    
    // Check all possible legacy locations for knowledge base documents
    const kbLocations = [
      details?.conversation_config?.agent?.knowledge_base?.document_ids,
      details?.knowledge_base?.document_ids,
      details?.agent?.knowledge_base?.document_ids,
      details?.conversation_config?.knowledge_base?.document_ids
    ];
    
    // Check if any location has document IDs
    return kbLocations.some(loc => 
      Array.isArray(loc) && loc.length > 0
    );
  };

  // Helper to get knowledge base details
  const getKnowledgeBaseDetails = (details: AgentDetails) => {
    const promptKnowledgeBase = details?.conversation_config?.agent?.prompt?.knowledge_base;
    if (Array.isArray(promptKnowledgeBase) && promptKnowledgeBase.length > 0) {
      const scrapedContent = promptKnowledgeBase.find(kb => kb.type === 'text' || kb.name?.includes('Content') || kb.name?.includes('FIRE-1'));
      const urlBased = promptKnowledgeBase.find(kb => kb.type === 'url' || kb.name?.includes('URL-based'));
      
      return {
        hasScrapedContent: !!scrapedContent,
        hasUrlBased: !!urlBased,
        scrapedContentName: scrapedContent?.name || 'Scraped Content',
        urlBasedName: urlBased?.name || 'URL-based Knowledge',
        totalKnowledgeBases: promptKnowledgeBase.length
      };
    }
    
    return {
      hasScrapedContent: false,
      hasUrlBased: false,
      scrapedContentName: '',
      urlBasedName: '',
      totalKnowledgeBases: 0
    };
  };

  // Function to check and record agent visit
  const checkAgentVisit = async (agentId: string) => {
    try {
      setIsCheckingVisit(true);
      
      // Generate a simple session ID for this browser session
      let sessionId = localStorage.getItem('agent_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('agent_session_id', sessionId);
      }

      // Call Supabase function to check and record visit
      const { data, error } = await supabase.rpc('check_and_record_agent_visit', {
        p_agent_id: agentId,
        p_ip_address: null, // We can't get real IP on client side
        p_user_agent: navigator.userAgent,
        p_referrer: document.referrer || null,
        p_session_id: sessionId
      });

      if (error) {
        console.error('Error checking agent visit:', error);
        // On error, allow the visit but show warning
        setIsVisitAllowed(true);
        toast({
          title: "Warning",
          description: "Could not verify visit limits. Proceeding with agent access.",
          variant: "destructive"
        });
        return;
      }

      const result = data as { 
        allowed: boolean; 
        current_visits: number; 
        max_visits: number; 
        remaining_visits: number; 
        blocked: boolean; 
        message: string; 
      };

      setVisitStats(result);
      setIsVisitAllowed(result.allowed);

      if (!result.allowed) {
        toast({
          title: "Access Limit Reached",
          description: `This agent has reached its visit limit (${result.max_visits} visits). Contact the agent owner for more access.`,
          variant: "destructive"
        });
      } else if (result.remaining_visits <= 2) {
        toast({
          title: "Limited Access Remaining",
          description: `${result.remaining_visits} visits remaining for this agent.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Unexpected error checking agent visit:', error);
      // On error, allow the visit but show warning
      setIsVisitAllowed(true);
      toast({
        title: "Warning",
        description: "Could not verify visit limits. Proceeding with agent access.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingVisit(false);
    }
  };

  // Helper to extract website URL from knowledge base
  const extractWebsiteUrlFromKnowledgeBase = async (details: AgentDetails): Promise<string> => {
    try {
      console.log('Attempting to extract website URL from knowledge base...');
      const promptKnowledgeBase = details?.conversation_config?.agent?.prompt?.knowledge_base;
      if (Array.isArray(promptKnowledgeBase) && promptKnowledgeBase.length > 0) {
        console.log('Found knowledge bases:', promptKnowledgeBase);
        
        // Look for URL-based knowledge base
        const urlBased = promptKnowledgeBase.find(kb => kb.type === 'url' || kb.name?.includes('URL-based') || kb.name?.includes('Website'));
        
        if (urlBased?.id) {
          console.log('Found URL-based knowledge base:', urlBased);
          
          // Fetch the knowledge base details to get the URL
          const apiKey = await getElevenLabsApiKey();
          if (apiKey) {
            try {
              // Try different potential API endpoints for knowledge base details
              const endpoints = [
                `https://api.elevenlabs.io/v1/convai/knowledge-base/${urlBased.id}`,
                `https://api.elevenlabs.io/v1/knowledge-base/${urlBased.id}`,
                `https://api.elevenlabs.io/v1/convai/knowledge-bases/${urlBased.id}`
              ];
              
              for (const endpoint of endpoints) {
                try {
                  console.log('Trying endpoint:', endpoint);
                  const response = await fetch(endpoint, {
                    headers: {
                      'xi-api-key': apiKey,
                      'Content-Type': 'application/json',
                    },
                  });
                  
                  if (response.ok) {
                    const kbDetails = await response.json();
                    console.log('Knowledge base details from', endpoint, ':', kbDetails);
                    
                    // The URL might be in different fields depending on the API response structure
                    const websiteUrl = kbDetails.url || kbDetails.source_url || kbDetails.data?.url || kbDetails.data?.source_url || kbDetails.original_url;
                    if (websiteUrl) {
                      console.log('✅ Extracted website URL from knowledge base:', websiteUrl);
                      return websiteUrl;
                    }
                  } else {
                    console.log('Endpoint failed with status:', response.status);
                  }
                } catch (endpointError) {
                  console.log('Endpoint error:', endpointError);
                }
              }
            } catch (error) {
              console.warn('Failed to fetch knowledge base details:', error);
            }
          }
        } else {
          console.log('No URL-based knowledge base found');
        }
      } else {
        console.log('No knowledge bases found in agent details');
      }
    } catch (error) {
      console.warn('Error extracting website URL from knowledge base:', error);
    }
    
    console.log('Could not extract website URL, returning empty string');
    return '';
  };

  // Load ElevenLabs widget script
  useEffect(() => {
    // Check if script already exists
    if (!document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => {
        setIsWidgetLoaded(true);
        console.log('ElevenLabs ConvAI widget loaded');
      };
      script.onerror = () => {
        console.error('Failed to load ElevenLabs ConvAI widget');
        toast({
          title: "Widget Load Error",
          description: "Failed to load voice chat widget. Please refresh the page.",
          variant: "destructive"
        });
      };
      document.head.appendChild(script);

      return () => {
        // Cleanup script when component unmounts
        const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
      };
    } else {
      // Script already exists, just set widget as loaded
      setIsWidgetLoaded(true);
    }
  }, [toast]);

  // Request microphone permissions when widget is loaded
  useEffect(() => {
    const requestMicrophonePermission = async () => {
      if (isWidgetLoaded && !micPermissionRequested) {
        setMicPermissionRequested(true);
        try {
          // Request microphone permission
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicPermissionGranted(true);
          console.log('Microphone permission granted');
          
          // Stop the stream immediately as we just needed permission
          stream.getTracks().forEach(track => track.stop());
          
          // Remove this toast notification
          // toast({
          //   title: "Microphone Access Granted",
          //   description: "You can now use voice chat with the agent.",
          // });
        } catch (error) {
          console.error('Microphone permission denied:', error);
          setMicPermissionGranted(false);
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice chat. Click the microphone icon in your browser's address bar.",
            variant: "destructive"
          });
        }
      }
    };

    requestMicrophonePermission();
  }, [isWidgetLoaded, micPermissionRequested, toast]);

  // Check visit limits when page loads
  useEffect(() => {
    if (agentId) {
      checkAgentVisit(agentId);
    }
  }, [agentId]);

  // Load agent details if not provided in location state
  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agentId) return;
      
      try {
        setIsLoadingAgent(true);
        const details = await getAgentDetails(agentId);
        setAgentDetails(details);
        console.log('Loaded agent details:', details);
        
        // Check if agent has knowledge base
        setHasKnowledgeBase(checkKnowledgeBase(details));
        
        // If we don't have createdAgent data from navigation state,
        // create a version from the fetched details with extracted website URL
        if (!localAgent) {
          const extractedWebsiteUrl = await extractWebsiteUrlFromKnowledgeBase(details);
          setLocalAgent({
            agentId: agentId,
            agentName: details.name || "Agent",
            companyName: "",
            websiteUrl: extractedWebsiteUrl,
            email: ""
          });
        }
      } catch (error) {
        console.error('Error loading agent details:', error);
        toast({
          title: "Warning",
          description: "Could not load agent details. Voice chat may still work.",
          variant: "destructive"
        });
        
        // Set minimal agent info if we failed to load
        if (!localAgent) {
          setLocalAgent({
            agentId: agentId,
            agentName: "Agent",
            companyName: "",
            websiteUrl: "",
            email: ""
          });
        }
      } finally {
        setIsLoadingAgent(false);
      }
    };

    fetchAgentDetails();
  }, [agentId, localAgent, toast]);

  // Handle manual creation of dual knowledge base (both scraped content and URL-based)
  const handleAssociateKnowledgeBase = async () => {
    if (!agentId || !localAgent?.websiteUrl) return;

    setLoadingAssociation(true);
    let scrapedKnowledgeBaseId: string | null = null;
    let urlKnowledgeBaseId: string | null = null;
    
    try {
      toast({
        title: "Creating Knowledge Bases",
        description: "Creating both scraped content and URL-based knowledge bases...",
      });
      
      // First, try to create scraped content knowledge base using FIRE-1 (always enabled for manual creation)
      try {
        const { firecrawlService } = await import('../services/firecrawlService');
        
        toast({
          title: "Creating Knowledge Bases",
          description: "Attempting intelligent website analysis with FIRE-1, falling back to standard extraction if needed...",
        });
        
        const fire1Result = await firecrawlService.extractCompanyInformationWithFIRE1(localAgent.websiteUrl);
        
        if (fire1Result.success && fire1Result.content) {
          // Create a text-based knowledge base from scraped content
          const { getElevenLabsApiKey } = await import('../services/elevenlabs');
          const apiKey = await getElevenLabsApiKey() || import.meta.env.VITE_ELEVENLABS_API_KEY;
          
          if (apiKey) {
            const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/text', {
              method: 'POST',
              headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: fire1Result.content,
                name: `${localAgent.companyName} FIRE-1 Extracted Content - ${new Date().toLocaleDateString()}`
              }),
            });
            
            if (response.ok) {
              const result = await response.json();
              scrapedKnowledgeBaseId = result.id || result.document_id;
              console.log('✅ FIRE-1 knowledge base created successfully');
            }
          }
        } else {
          console.warn('FIRE-1 extraction returned no content, will try standard scraping');
        }
      } catch (error) {
        console.warn('FIRE-1 extraction failed, will try standard scraping:', error);
      }
      
      // Fallback to standard scraping if FIRE-1 didn't work
      if (!scrapedKnowledgeBaseId) {
        try {
          const { firecrawlService } = await import('../services/firecrawlService');
          const scrapeResult = await firecrawlService.scrapeWebsite(localAgent.websiteUrl);
          
          if (scrapeResult.success && scrapeResult.content) {
            const { getElevenLabsApiKey } = await import('../services/elevenlabs');
            const apiKey = await getElevenLabsApiKey() || import.meta.env.VITE_ELEVENLABS_API_KEY;
            
            if (apiKey) {
              const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/text', {
                method: 'POST',
                headers: {
                  'xi-api-key': apiKey,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  text: scrapeResult.content,
                  name: `${localAgent.companyName} Scraped Content - ${new Date().toLocaleDateString()}`
                }),
              });
              
              if (response.ok) {
                const result = await response.json();
                scrapedKnowledgeBaseId = result.id || result.document_id;
                console.log('✅ Standard scraping knowledge base created successfully');
              }
            }
          }
        } catch (error) {
          console.warn('Standard scraping also failed:', error);
        }
      }
      
      // Create URL-based knowledge base
      try {
        urlKnowledgeBaseId = await createWebsiteKnowledgeBase(
          localAgent.websiteUrl,
          localAgent.companyName || 'My Company'
        );
      } catch (error) {
        console.warn('Failed to create URL-based knowledge base:', error);
      }
      
      if (!scrapedKnowledgeBaseId && !urlKnowledgeBaseId) {
        throw new Error('Failed to create any knowledge bases');
      }
      
      toast({
        title: "Knowledge Bases Created",
        description: `Created ${[scrapedKnowledgeBaseId, urlKnowledgeBaseId].filter(Boolean).length} knowledge base(s). Now associating with your agent...`,
      });
      
      // Associate both knowledge bases with the agent
      const knowledgeBasesToAssociate = [];
      
      if (scrapedKnowledgeBaseId) {
        knowledgeBasesToAssociate.push({
          id: scrapedKnowledgeBaseId,
          name: 'Scraped Content'
        });
      }
      
      if (urlKnowledgeBaseId) {
        knowledgeBasesToAssociate.push({
          id: urlKnowledgeBaseId,
          name: 'URL-based Knowledge'
        });
      }
      
      // Associate each knowledge base with the agent
      for (const kb of knowledgeBasesToAssociate) {
        try {
          await associateKnowledgeBaseWithAgent(agentId, kb.id);
        } catch (error) {
          console.warn(`Failed to associate ${kb.name}:`, error);
        }
      }
      
      // Refresh agent details to confirm association
      const updatedDetails = await getAgentDetails(agentId);
      setAgentDetails(updatedDetails);
      setHasKnowledgeBase(checkKnowledgeBase(updatedDetails));
      
      const kbDetails = getKnowledgeBaseDetails(updatedDetails);
      
      toast({
        title: "Success!",
        description: `Created and associated ${kbDetails.totalKnowledgeBases} knowledge base source(s) with your agent.`,
      });
    } catch (error) {
      console.error('Error creating knowledge bases:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create knowledge bases. Try again or check ElevenLabs dashboard.",
        variant: "destructive"
      });
    } finally {
      setLoadingAssociation(false);
    }
  };

  // Handle manual voice update to Sarah
  const handleUpdateVoice = async () => {
    if (!agentId) return;

    setLoadingVoiceUpdate(true);
    try {
      toast({
        title: "Updating Voice",
        description: "Updating agent voice to Sarah...",
      });
      
      // Update the agent's voice to Sarah
      await updateAgentVoice(agentId);
      
      // Refresh agent details to confirm the update
      const updatedDetails = await getAgentDetails(agentId);
      setAgentDetails(updatedDetails);
      
      toast({
        title: "Voice Updated!",
        description: "Agent voice has been updated to Sarah. Refresh the page to see the changes.",
      });
    } catch (error) {
      console.error('Error updating agent voice:', error);
      toast({
        title: "Voice Update Failed",
        description: "Failed to update agent voice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingVoiceUpdate(false);
    }
  };

  // Handle manual updating LLM to Gemini 2.5 Flash
  const handleUpdateLLM = async () => {
    if (!agentId) return;

    setLoadingLLM(true);
    try {
      toast({
        title: "Updating LLM",
        description: "Updating agent LLM to Gemini 2.5 Flash...",
      });
      
      // Update using the exported function
      await updateAgentLLM(agentId);
      
      // Refresh agent details to confirm the update
      const updatedDetails = await getAgentDetails(agentId);
      setAgentDetails(updatedDetails);
      
      // Log the current configuration to verify model name
      console.log('Agent details after LLM update:', JSON.stringify(updatedDetails, null, 2));
      console.log('Current LLM configuration:', 
        updatedDetails?.conversation_config?.llm || 
        'LLM config not found in response'
      );
      
      toast({
        title: "LLM Updated!",
        description: "Agent LLM has been updated to Gemini 2.5 Flash. Refresh the page to see the changes.",
      });
    } catch (error) {
      console.error('Error updating agent LLM:', error);
      toast({
        title: "LLM Update Failed",
        description: "Failed to update agent LLM. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingLLM(false);
    }
  };

  // Debug function to check available LLM models
  const handleCheckAvailableModels = async () => {
    try {
      toast({
        title: "Checking Available Models",
        description: "Fetching available LLM models from ElevenLabs API...",
      });
      
      const models = await getAvailableLLMModels();
      console.log('Available LLM models:', models);
      
      toast({
        title: "Models Check Complete",
        description: "Check console for available LLM models",
      });
    } catch (error) {
      console.error('Error checking available LLM models:', error);
      toast({
        title: "Models Check Failed",
        description: "Failed to fetch available LLM models. Check console for details.",
        variant: "destructive"
      });
    }
  };

  // Debug function to show the current model format
  const handleShowModelFormat = () => {
    const format = getSuccessfulModelFormat();
    console.log('Current successful model format:', format);
    toast({
      title: "Current Model Format",
      description: `Current model format: ${format}`,
    });
  };

  // Helper function to get LLM model name safely
  const getLLMModelName = (agentDetails: any) => {
    if (!agentDetails || !agentDetails.conversation_config) return null;
    
    // The LLM configuration might be at different locations in the response
    // Try all possible locations
    const config = agentDetails.conversation_config;
    
    // Check direct llm property
    if (config.llm && config.llm.model_name) {
      return config.llm.model_name;
    }
    
    // Check under agent.llm
    if (config.agent && config.agent.llm && config.agent.llm.model_name) {
      return config.agent.llm.model_name;
    }
    
    return null;
  };

  if (isLoadingAgent) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex flex-col items-center justify-center p-8">
          <img 
            src="/DYOTA_logo-removebg-preview.png" 
            alt="Loading Agent" 
            className="w-36 h-36 animate-pulse mb-6" 
          />
          <div className="flex items-center">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span className="text-xl font-semibold">Loading agent details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!localAgent || !agentId) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
          <p>Unable to find the requested agent.</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking visit limits
  if (isCheckingVisit) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex flex-col items-center justify-center p-8">
          <img 
            src="/DYOTA_logo-removebg-preview.png" 
            alt="Checking Access" 
            className="w-36 h-36 animate-pulse mb-6" 
          />
          <div className="flex items-center">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span className="text-xl font-semibold">Checking access limits...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show blocked access UI if visit limit reached
  if (isVisitAllowed === false) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Limit Reached</h1>
            <p className="text-lg text-gray-600 mb-6">
              This agent has reached its visit limit ({visitStats?.max_visits || 10} visits).
            </p>
            
            {visitStats && (
              <Card className="max-w-md mx-auto mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Visit Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total visits:</span>
                    <span className="font-semibold">{visitStats.current_visits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximum allowed:</span>
                    <span className="font-semibold">{visitStats.max_visits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-semibold text-red-600">{visitStats.remaining_visits}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Contact the agent owner to request additional access or create your own agent.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/create-agent">
                    <Bot className="w-4 h-4 mr-2" />
                    Create Your Own Agent
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link to="/">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Show logo at bottom */}
          <div className="mt-8">
            <img 
              src="/DYOTA_logo-removebg-preview.png" 
              alt="DYOTA Logo" 
              className="w-24 h-24 opacity-50" 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Website Preview in full screen */}
      {localAgent.websiteUrl ? (
        <div className="relative w-full h-full">
          <WebsiteIframe 
            src={localAgent.websiteUrl}
            title="Website Preview"
            className="w-full h-full border-none"
            fallbackMessage="This website cannot be embedded due to security restrictions, but you can still access it directly."
            showFallbackOptions={true}
            onLoadError={() => {
              toast({
                title: "Website Loading Issue",
                description: "The website cannot be embedded due to security policies. You can still open it in a new tab.",
                variant: "default"
              });
            }}
          />
          
          {/* Bottom overlay with branding */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pointer-events-none">
            <div className="flex items-center justify-between">
              <a href="/pricing" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 pointer-events-auto bg-white px-3 py-1.5 rounded-2xl shadow-md">
                <img src="/DYOTA_logo-removebg-preview.png" alt="DYOTA Logo" className="h-10 w-auto" />
                <span className="text-black font-semibold">Get Now</span>
              </a>
              </div>
             
          </div>
          
          {/* ElevenLabs Widget - positioned in the bottom right */}
          <div className="absolute bottom-16 right-4 z-10">
            {isWidgetLoaded && localAgent ? (
              micPermissionGranted ? (
                <div className="bg-white rounded-lg shadow-lg p-2">
                  {React.createElement('elevenlabs-convai', {
                    'agent-id': localAgent.agentId,
                    'variant': 'compact',
                    'avatar-image-url': '/22221.png',
                    'avatar-orb-color-1': '#2792dc',
                    'avatar-orb-color-2': '#9ce6e6',
                    'text-input': 'false',
                    'text-only-mode': 'false'
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center max-w-xs">
                  <div className="flex items-center mb-2">
                    <MessageCircle className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-sm font-medium">Microphone Access Required</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center mb-3">
                    Please allow microphone access to start voice chat
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => window.location.reload()}
                    className="text-xs"
                  >
                    Refresh Page
                  </Button>
                </div>
              )
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-4 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Loading widget...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="mb-4 text-lg text-gray-600">No website preview available</p>
            
            {/* Knowledge Base Status */}
            {agentDetails && (
              <div className="mb-6 flex flex-col items-center">
                {(() => {
                  const kbDetails = getKnowledgeBaseDetails(agentDetails);
                  
                  if (kbDetails.totalKnowledgeBases === 0) {
                    return (
                      <div className="flex items-center text-yellow-600 mb-2">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span>No knowledge base detected</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center text-green-600 mb-2">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span>Knowledge base connected ({kbDetails.totalKnowledgeBases} sources)</span>
                      </div>
                      
                      {/* Show knowledge base types */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {kbDetails.hasScrapedContent && (
                          <Badge variant="secondary" className="text-xs">
                            📄 Scraped Content
                          </Badge>
                        )}
                        {kbDetails.hasUrlBased && (
                          <Badge variant="secondary" className="text-xs">
                            🌐 URL-based Knowledge
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })()}
                
                {!hasKnowledgeBase && !loadingAssociation && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleAssociateKnowledgeBase}
                    className="mt-2"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Create knowledge base
                  </Button>
                )}
                
                {loadingAssociation && (
                  <div className="flex items-center mt-2">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">Creating knowledge base...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Voice Status */}
            {agentDetails && (
              <div className="mb-6 flex flex-col items-center">
                <div className="flex items-center text-blue-600 mb-2">
                  <Bot className="w-5 h-5 mr-2" />
                  <span>Update agent voice to Sarah</span>
                </div>
                
                {!loadingVoiceUpdate && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleUpdateVoice}
                    className="mt-2"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Fix Voice to Sarah
                  </Button>
                )}
                
                {loadingVoiceUpdate && (
                  <div className="flex items-center mt-2">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">Updating voice...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* LLM Status */}
            {agentDetails && (
              <div className="mb-6 flex flex-col items-center">
                <div className="flex items-center text-purple-600 mb-2">
                  <Cpu className="w-5 h-5 mr-2" />
                  <span>Update agent LLM to Gemini 2.5 Flash</span>
                </div>
                
                {!loadingLLM && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleUpdateLLM}
                    className="mt-2"
                  >
                    <Cpu className="w-4 h-4 mr-2" />
                    Set LLM to Gemini 2.5 Flash
                  </Button>
                )}
                
                {loadingLLM && (
                  <div className="flex items-center mt-2">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">Updating LLM...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* ElevenLabs Widget - centered when no website */}
            {isWidgetLoaded && localAgent ? (
              micPermissionGranted ? (
                <div className="mt-8">
                  {React.createElement('elevenlabs-convai', {
                    'agent-id': localAgent.agentId,
                    'variant': 'compact',
                    'avatar-image-url': '/22221.png',
                    'avatar-orb-color-1': '#2792dc',
                    'avatar-orb-color-2': '#9ce6e6',
                    'text-input': 'false',
                    'text-only-mode': 'false'
                  })}
                </div>
              ) : (
                <div className="mt-8 bg-white rounded-lg shadow-lg p-6 flex flex-col items-center max-w-md mx-auto">
                  <div className="flex items-center mb-3">
                    <MessageCircle className="w-5 h-5 text-orange-500 mr-2" />
                    <span className="text-lg font-medium">Microphone Access Required</span>
                  </div>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    To start voice chat with your agent, please allow microphone access when prompted by your browser.
                  </p>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="mb-2"
                  >
                    Refresh Page
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Look for the microphone icon in your browser's address bar and click "Allow"
                  </p>
                </div>
              )
            ) : (
              <div className="mt-8 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Loading voice chat widget...</span>
              </div>
            )}
            
            {/* Debug buttons for developers */}
            <div className="flex flex-col gap-2 mt-2">
              <Button 
                variant="secondary"
                size="sm"
                onClick={handleCheckAvailableModels}
                className="text-xs"
              >
                Check Available Models
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={handleShowModelFormat}
                className="text-xs"
              >
                Show Current Model Format
              </Button>
            </div>
            
            {/* Display current model if available */}
            {agentDetails && (
              <div className="mt-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Cpu className="h-4 w-4" /> Current LLM Model
                </h3>
                <p className="text-sm mt-1">
                  {getLLMModelName(agentDetails) || "Not specified"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPage;
