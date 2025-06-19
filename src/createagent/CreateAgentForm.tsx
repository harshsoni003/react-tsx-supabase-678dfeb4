import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Bot, Building2, Globe, Mail, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { createAgent } from './services/agentCreationService';

interface CreateAgentFormProps {
  onSuccess?: (agentId: string, agentData: FormData) => void;
  onCancel?: () => void;
  showBackButton?: boolean;
}

interface FormData {
  email: string;
  companyName: string;
  websiteUrl: string;
  agentName: string;
  useFire1Extraction: boolean;
}

const CreateAgentForm = ({ onSuccess, onCancel, showBackButton = false }: CreateAgentFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    companyName: '',
    websiteUrl: '',
    agentName: '',
    useFire1Extraction: false // Default to unchecked
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
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

    // Improved URL validation to handle special cases
    try {
      // Remove any leading @ if present
      let urlToValidate = formData.websiteUrl.trim();
      if (urlToValidate.startsWith('@')) {
        urlToValidate = urlToValidate.substring(1);
      }
      
      // Add protocol if missing
      if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
        urlToValidate = `https://${urlToValidate}`;
      }
      
      new URL(urlToValidate);
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
    const extractionMethod = formData.useFire1Extraction ? 'FIRE-1 intelligent extraction' : 'standard website scraping';
    setLoadingStep(`Starting ${extractionMethod}...`);

    try {
      // Improved URL processing
      let websiteUrl = formData.websiteUrl.trim();
      
      // Remove any leading @ if present
      if (websiteUrl.startsWith('@')) {
        websiteUrl = websiteUrl.substring(1);
      }
      
      // Add protocol if missing
      if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        websiteUrl = `https://${websiteUrl}`;
      }

      const agentData = {
        ...formData,
        websiteUrl,
        agentName: formData.agentName || `${formData.companyName} Assistant`
      };

      setLoadingStep('Creating dual knowledge bases...');
      // Small delay to show the step change
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStep('Building AI agent with knowledge...');
      const agentId = await createAgent(agentData);

      // Reset form
      setFormData({
        email: '',
        companyName: '',
        websiteUrl: '',
        agentName: '',
        useFire1Extraction: false
      });

      const extractionType = formData.useFire1Extraction ? "FIRE-1 intelligent extraction" : "standard website scraping";
      toast({
        title: "Agent Created Successfully!",
        description: `Your AI agent has been created with dual knowledge bases using ${extractionType} and URL-based knowledge.`,
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(agentId, agentData);
      } else {
        // Navigate to the agent page if no callback provided
        navigate(`/agent/${agentId}`, { 
          state: { 
            agent: {
              agentId,
              agentName: agentData.agentName,
              companyName: agentData.companyName,
              websiteUrl: agentData.websiteUrl,
              email: agentData.email
            }
          }
        });
      }

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
      {showBackButton && (
        <div className="absolute top-4 left-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGoBack}
            className="flex items-center gap-2 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl border border-gray-100 max-w-md mx-4 flex flex-col items-center">
            <div className="mb-6">
              <img 
                src="/DYOTA_logo-removebg-preview.png" 
                alt="Building Agent" 
                className="w-36 h-36 animate-pulse" 
              />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="w-5 h-5 animate-spin mr-3" />
                <span className="text-xl font-semibold">Building Your Agent</span>
              </div>
              {loadingStep && (
                <p className="text-gray-600">{loadingStep}</p>
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
            value={formData.websiteUrl}
            onChange={(e) => updateFormData('websiteUrl', e.target.value)}
            placeholder="www.yourcompany.com or @domain.com"
            required
            className="mt-1"
          />
        </div>

        {/* FIRE-1 Extraction Checkbox */}
        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Checkbox
            id="useFire1Extraction"
            checked={formData.useFire1Extraction}
            onCheckedChange={(checked) => updateFormData('useFire1Extraction', checked === true)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="useFire1Extraction" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Use deep extraction of {formData.websiteUrl || "website URL"}
            </Label>
            <p className="text-xs text-gray-600 mt-1">
              Note: May take longer to process depending on website data <span className="text-[15px] text-red-500">(20 sec to 5 min)</span>.
            </p>
          </div>
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
            className="flex-1 bg-black hover:bg-gray-800 text-white w-full"
          >
            Create Agent
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAgentForm;
