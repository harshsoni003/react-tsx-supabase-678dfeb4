import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bot, Building2, Globe, Mail } from 'lucide-react';
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

      const agentId = await createAgent(agentData);

      toast({
        title: "Agent Created Successfully!",
        description: `Your agent "${agentData.agentName}" has been created and configured with knowledge from your website.`
      });

      // Reset form
      setFormData({
        email: '',
        companyName: '',
        websiteUrl: '',
        agentName: ''
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
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <Bot className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Create Your AI Agent</h2>
        <p className="text-gray-600">Fill in the details to create your custom voice agent</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            This website will be automatically added to your agent's knowledge base
          </p>
        </div>

        {/* Agent Name Field (Optional) */}
        <div>
          <Label htmlFor="agentName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Bot className="w-4 h-4" />
            Agent Name (Optional)
          </Label>
          <Input
            id="agentName"
            value={formData.agentName}
            onChange={(e) => updateFormData('agentName', e.target.value)}
            placeholder="Leave empty to auto-generate"
            className="mt-1"
          />
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
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Agent...
              </>
            ) : (
              'Create Agent'
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        * Required fields
      </div>
    </div>
  );
};

export default CreateAgentForm; 