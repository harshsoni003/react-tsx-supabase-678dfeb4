
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bot, Building2, Globe, Mail, Loader2 } from 'lucide-react';
import { createAgent } from './services/agentCreationService';

interface CreateAgentFormProps {
  onSuccess?: (agentId: string, agentData: FormData) => void;
  onCancel?: () => void;
}

interface FormData {
  email: string;
  companyName: string;
  websiteUrl: string;
  agentName: string;
}

const CreateAgentForm = ({ onSuccess, onCancel }: CreateAgentFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    companyName: '',
    websiteUrl: '',
    agentName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const { toast } = useToast();

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.companyName.trim()) {
      toast({
        title: "Company Name Required",
        description: "Please enter your company name.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.websiteUrl.trim()) {
      toast({
        title: "Website URL Required",
        description: "Please enter your website URL.",
        variant: "destructive"
      });
      return false;
    }

    // Basic URL validation
    try {
      const url = formData.websiteUrl.startsWith('http') 
        ? formData.websiteUrl 
        : `https://${formData.websiteUrl}`;
      new URL(url);
    } catch {
      toast({
        title: "Invalid Website URL",
        description: "Please enter a valid website URL.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoadingStep('Scraping website content...');

    try {
      // Ensure website URL has proper protocol
      const websiteUrl = formData.websiteUrl.startsWith('http') 
        ? formData.websiteUrl 
        : `https://${formData.websiteUrl}`;

      const agentData = {
        ...formData,
        websiteUrl,
        agentName: formData.agentName || `${formData.companyName} Assistant`
      };

      setLoadingStep('Creating knowledge base...');
      // Small delay to show the step change
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStep('Creating AI agent...');
      const agentId = await createAgent(agentData);

      // Reset form
      setFormData({
        email: '',
        companyName: '',
        websiteUrl: '',
        agentName: ''
      });

      toast({
        title: "Agent Created Successfully!",
        description: "Your AI agent has been created with website knowledge.",
      });

      // Call success callback
      onSuccess?.(agentId, agentData);

    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Failed to Create Agent",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 relative overflow-visible">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center pt-20 z-50">
          <div className="bg-white rounded-lg p-6 mb-6 flex flex-col items-center justify-center shadow-2xl border-2 border-gray-100 max-w-md mx-4">
            <div className="mb-4">
              <img 
                src="/spark-unscreen.gif" 
                alt="Creating" 
                className="w-32 h-32" 
              />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-lg font-semibold">Creating Your Agent</span>
              </div>
              {loadingStep && (
                <p className="text-gray-600 text-sm">{loadingStep}</p>
              )}
            </div>
          </div>          
        </div>
      )}
      <div className="text-center mb-6">
        <img 
          src="/DYOTA_logo-removebg-preview.png" 
          alt="DYOTA Logo" 
          className="h-24 mx-auto mb-2" 
        />
        <h2 className="text-2xl font-bold text-gray-800">Voice Bolt</h2>
        <p className="text-gray-600">Fill in the details to create your custom voice agent</p>
        <p className="text-sm text-blue-600 mt-1">Website content will be automatically extracted and added to your agent's knowledge base</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 overflow-visible">
        {/* Email Field */}
        <div>
          <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Mail className="w-4 h-4" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="john@company.com"
            required
            className="mt-1"
          />
        </div>

        {/* Company Name Field */}
        <div>
          <Label htmlFor="companyName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building2 className="w-4 h-4" />
            Company Name *
          </Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => updateFormData('companyName', e.target.value)}
            placeholder="Your Company Inc."
            required
            className="mt-1"
          />
        </div>

        {/* Website URL Field */}
        <div>
          <Label htmlFor="websiteUrl" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Globe className="w-4 h-4" />
            Website URL *
          </Label>
          <Input
            id="websiteUrl"
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => updateFormData('websiteUrl', e.target.value)}
            placeholder="www.yourcompany.com"
            required
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Content from this website will be automatically extracted and added to your agent's knowledge base
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full"
          >
            Create Agent
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAgentForm;
