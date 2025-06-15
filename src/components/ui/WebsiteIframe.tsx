import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, 
  AlertTriangle, 
  Globe, 
  RefreshCw,
  Eye,
  Shield
} from 'lucide-react';
import { isDomainLikelyBlocked, getRecommendedProxy, PROXY_SERVICES } from '@/utils/websiteEmbedChecker';

interface WebsiteIframeProps {
  src: string;
  title?: string;
  className?: string;
  fallbackMessage?: string;
  showFallbackOptions?: boolean;
  onLoadError?: () => void;
  onLoadSuccess?: () => void;
}

const WebsiteIframe: React.FC<WebsiteIframeProps> = ({
  src,
  title = "Website Preview",
  className = "w-full h-full border-none",
  fallbackMessage,
  showFallbackOptions = true,
  onLoadError,
  onLoadSuccess
}) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [useProxy, setUseProxy] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Clean and validate URL
  const cleanUrl = (url: string): string => {
    if (!url) return '';
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  // Check if domain is likely blocked and prepare proxy services
  const isLikelyBlocked = isDomainLikelyBlocked(src);
  const proxyServices = [
    cleanUrl(src), // Direct first
    ...PROXY_SERVICES.map(service => service.url(cleanUrl(src)))
  ];

  const finalSrc = useProxy && retryCount > 0
    ? proxyServices[Math.min(retryCount, proxyServices.length - 1)]
    : cleanUrl(src);

  useEffect(() => {
    setLoadError(false);
    setIsLoading(true);
    setRetryCount(0);
    
    // If domain is likely blocked, show warning but still try
    if (isLikelyBlocked) {
      console.warn('Domain is likely to block embedding:', cleanUrl(src));
    }
    
    // Set a timeout to detect if iframe fails to load
    // Shorter timeout for known blocked domains
    const timeout = isLikelyBlocked ? 5000 : 10000;
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn('Iframe load timeout, assuming blocked by security policy');
        handleLoadError();
      }
    }, timeout);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src, useProxy, isLikelyBlocked]);

  const handleLoadError = () => {
    console.error('Iframe failed to load:', finalSrc);
    setLoadError(true);
    setIsLoading(false);
    onLoadError?.();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleLoadSuccess = () => {
    console.log('Iframe loaded successfully:', finalSrc);
    setLoadError(false);
    setIsLoading(false);
    onLoadSuccess?.();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    setLoadError(false);
    setIsLoading(true);
    
    // Try with proxy after first retry
    if (newRetryCount >= 1) {
      setUseProxy(true);
    }
    
    // Force iframe reload with new source
    if (iframeRef.current) {
      const newSrc = useProxy && newRetryCount > 0
        ? proxyServices[Math.min(newRetryCount, proxyServices.length - 1)]
        : cleanUrl(src);
      iframeRef.current.src = newSrc;
    }
  };

  const handleOpenInNewTab = () => {
    window.open(cleanUrl(src), '_blank', 'noopener,noreferrer');
  };

  // Detect iframe load errors using postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check for iframe security errors
      if (event.data && typeof event.data === 'string') {
        if (event.data.includes('X-Frame-Options') || 
            event.data.includes('frame-ancestors') ||
            event.data.includes('refused to connect')) {
          handleLoadError();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Website Cannot Be Embedded</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {fallbackMessage || 
                  "This website has security policies that prevent it from being displayed in an embedded frame. This is a common security measure."
                }
              </AlertDescription>
            </Alert>

            {showFallbackOptions && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 text-center">
                  You can still access the website using these options:
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={handleOpenInNewTab}
                    className="w-full"
                    variant="default"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                  
                  {retryCount < 3 && (
                    <Button 
                      onClick={handleRetry}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again {useProxy ? '(with proxy)' : ''}
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => setUseProxy(!useProxy)}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    {useProxy ? 'Try Direct Connection' : 'Try Proxy Connection'}
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center mt-4">
                  <p>Website URL: {cleanUrl(src)}</p>
                  {useProxy && <p className="text-orange-600">Using proxy service</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Loading website...</p>
            {useProxy && (
              <p className="text-xs text-orange-600 mt-1">Using proxy service</p>
            )}
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={finalSrc}
        className={className}
        title={title}
        sandbox="allow-same-origin allow-scripts allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox allow-microphone allow-camera"
        allow="microphone; camera; autoplay; encrypted-media; fullscreen"
        onLoad={handleLoadSuccess}
        onError={handleLoadError}
        // Additional error detection
        onLoadStart={() => setIsLoading(true)}
      />
      
      {/* Invisible script to detect X-Frame-Options errors */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('error', function(e) {
              if (e.message && (e.message.includes('X-Frame-Options') || e.message.includes('frame-ancestors'))) {
                window.parent.postMessage('iframe-blocked', '*');
              }
            });
          `
        }}
      />
    </div>
  );
};

export default WebsiteIframe; 