
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, User, Briefcase, Target } from 'lucide-react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAgentModal = ({ isOpen, onClose }: CreateAgentModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    useCase: '',
    agentName: '',
    agentPurpose: ''
  });
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Agent Creation Started!",
      description: "We'll contact you shortly to set up your custom voice agent.",
    });
    onClose();
    setStep(1);
    setFormData({
      name: '',
      email: '',
      company: '',
      useCase: '',
      agentName: '',
      agentPurpose: ''
    });
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Tell us about yourself</h3>
              <p className="text-gray-600">We'll use this to personalize your experience</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="Your Company Inc."
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">What's your use case?</h3>
              <p className="text-gray-600">Help us understand how you want to use Voice Bolt</p>
            </div>
            <div>
              <Label htmlFor="useCase">Describe your use case</Label>
              <textarea
                id="useCase"
                value={formData.useCase}
                onChange={(e) => updateFormData('useCase', e.target.value)}
                className="w-full min-h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="e.g., Customer support for my e-commerce store, Lead qualification for my sales team, Appointment booking for my clinic..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Design your agent</h3>
              <p className="text-gray-600">Let's create your first voice agent</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agentName">Agent Name</Label>
                <Input
                  id="agentName"
                  value={formData.agentName}
                  onChange={(e) => updateFormData('agentName', e.target.value)}
                  placeholder="e.g., Sarah the Support Assistant"
                />
              </div>
              <div>
                <Label htmlFor="agentPurpose">Agent Purpose</Label>
                <textarea
                  id="agentPurpose"
                  value={formData.agentPurpose}
                  onChange={(e) => updateFormData('agentPurpose', e.target.value)}
                  className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="What should your agent help customers with?"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Voice Agent</DialogTitle>
          <DialogDescription>
            Step {step} of 3 - Let's get your voice agent set up
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-3 h-3 rounded-full ${
                  stepNumber <= step ? 'bg-blue-600' : 'bg-gray-300'
                } transition-colors duration-300`}
              />
            ))}
          </div>
        </div>

        {renderStep()}

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="px-6"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
          >
            {step === 3 ? 'Create Agent' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentModal;
