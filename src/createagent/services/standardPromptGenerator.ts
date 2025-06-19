import { AgentCreationData } from './agentCreationService';

/**
 * Generate a simple agent prompt for standard extraction (when FIRE-1 is not used)
 * This uses a basic template with minimal company information
 */
export const generateSimpleAgentPrompt = (data: AgentCreationData): string => {
  return `You are an expert extraction algorithm.
Only extract relevant information from the text.
If you don't know anything then just add "{use your Agent knowledge base to find the information}". Do not make-up them yourself, do not hallucinate.

Your task is to extract company information in below format:`
};


/**
 * Generate a simple first message for the agent (when FIRE-1 is not used)
 * Uses basic company name and default value proposition
 */
export const generateSimpleFirstMessage = (data: AgentCreationData): string => {
  return `Hi! I'm Sarah from ${data.companyName}. I help you build voice AI for your business.`;
};

/**
 * Generate a simple company information object for standard extraction
 * This provides minimal data structure when FIRE-1 is not used
 */
export const generateSimpleCompanyInfo = (data: AgentCreationData) => {
  return {
    companyName: data.companyName,
    companyIndustryType: undefined,
    companySummary: undefined,
    companyServices: undefined,
    companyPricings: undefined,
    companyEmail: undefined,
    companyFAQ: undefined,
    companySocials: undefined,
    valueProposition: "I help you build voice AI for your business.",
    problemSolving: undefined,
    companySolution: undefined,
    companyCTA: undefined,
    additionalInfo: undefined
  };
}; 