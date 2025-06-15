// Utility to check if a website can be embedded and provide alternatives

export interface EmbedCheckResult {
  canEmbed: boolean;
  reason?: string;
  alternatives: string[];
  recommendedProxy?: string;
}

// Known websites that typically block embedding
const KNOWN_BLOCKED_DOMAINS = [
  'google.com',
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'linkedin.com',
  'youtube.com',
  'github.com',
  'stackoverflow.com',
  'reddit.com',
  'amazon.com',
  'apple.com',
  'microsoft.com',
  'netflix.com',
  'paypal.com',
  'stripe.com',
  'zoom.us',
  'slack.com',
  'discord.com',
  'whatsapp.com',
  'telegram.org'
];

// Proxy services with their characteristics
export const PROXY_SERVICES = [
  {
    name: 'AllOrigins',
    url: (targetUrl: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    description: 'Good for simple websites',
    reliability: 'high'
  },
  {
    name: 'CORS Anywhere',
    url: (targetUrl: string) => `https://cors-anywhere.herokuapp.com/${targetUrl}`,
    description: 'Popular but may have rate limits',
    reliability: 'medium'
  },
  {
    name: 'ThingProxy',
    url: (targetUrl: string) => `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
    description: 'Reliable for most content',
    reliability: 'high'
  },
  {
    name: 'CORS Proxy',
    url: (targetUrl: string) => `https://proxy.cors.sh/${targetUrl}`,
    description: 'Fast and reliable',
    reliability: 'high'
  },
  {
    name: 'CORSProxy.io',
    url: (targetUrl: string) => `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    description: 'Good for complex websites',
    reliability: 'medium'
  }
];

export const checkWebsiteEmbedding = async (url: string): Promise<EmbedCheckResult> => {
  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
  
  try {
    const urlObj = new URL(cleanUrl);
    const domain = urlObj.hostname.toLowerCase();
    
    // Check against known blocked domains
    const isKnownBlocked = KNOWN_BLOCKED_DOMAINS.some(blockedDomain => 
      domain.includes(blockedDomain) || domain.endsWith(`.${blockedDomain}`)
    );
    
    if (isKnownBlocked) {
      return {
        canEmbed: false,
        reason: 'This website is known to block embedding for security reasons',
        alternatives: PROXY_SERVICES.map(service => service.url(cleanUrl)),
        recommendedProxy: PROXY_SERVICES[0].url(cleanUrl)
      };
    }
    
    // Try to fetch headers to check for X-Frame-Options
    try {
      const response = await fetch(cleanUrl, { 
        method: 'HEAD',
        mode: 'no-cors' // This will limit what we can see, but won't be blocked by CORS
      });
      
      // If we get here without error, the site might be embeddable
      return {
        canEmbed: true,
        alternatives: PROXY_SERVICES.map(service => service.url(cleanUrl))
      };
    } catch (fetchError) {
      // CORS error or other network error - might still be embeddable in iframe
      return {
        canEmbed: true, // Assume embeddable unless proven otherwise
        alternatives: PROXY_SERVICES.map(service => service.url(cleanUrl)),
        reason: 'Could not pre-check embedding status'
      };
    }
    
  } catch (error) {
    return {
      canEmbed: false,
      reason: 'Invalid URL format',
      alternatives: []
    };
  }
};

// Check if a domain is likely to block embedding
export const isDomainLikelyBlocked = (url: string): boolean => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const domain = urlObj.hostname.toLowerCase();
    
    return KNOWN_BLOCKED_DOMAINS.some(blockedDomain => 
      domain.includes(blockedDomain) || domain.endsWith(`.${blockedDomain}`)
    );
  } catch {
    return false;
  }
};

// Get a recommended proxy for a given URL
export const getRecommendedProxy = (url: string): string => {
  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
  
  // Use AllOrigins as default - it's most reliable
  return PROXY_SERVICES[0].url(cleanUrl);
};

// Test if an iframe can load a URL (client-side check)
export const testIframeLoad = (url: string, timeout: number = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    
    let resolved = false;
    
    const cleanup = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };
    
    const resolveOnce = (result: boolean) => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(result);
      }
    };
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      resolveOnce(false);
    }, timeout);
    
    // Listen for load success
    iframe.onload = () => {
      clearTimeout(timeoutId);
      resolveOnce(true);
    };
    
    // Listen for load error
    iframe.onerror = () => {
      clearTimeout(timeoutId);
      resolveOnce(false);
    };
    
    // Try to load the URL
    iframe.src = url;
    document.body.appendChild(iframe);
  });
}; 