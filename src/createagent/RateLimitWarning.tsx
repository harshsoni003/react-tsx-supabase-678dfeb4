import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitWarningProps {
  onContinue?: () => void;
  onCancel?: () => void;
  showBackButton?: boolean;
}

const RateLimitWarning = ({ onContinue, onCancel, showBackButton = false }: RateLimitWarningProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('waitlist_emails')
        .insert([{
          email: email.trim().toLowerCase(),
          created_at: new Date().toISOString(),
          status: 'pending'
        }]);

      if (error && error.code !== '23505') {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "Success",
        description: "You've been added to our waitlist. We'll be in touch soon.",
      });
    } catch (error) {
      console.error('Error saving email:', error);
      toast({
        title: "Error",
        description: "There was an issue adding you to the waitlist. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter an access code.",
        variant: "destructive"
      });
      return;
    }

    setIsValidatingCode(true);

    try {
      const { data, error } = await supabase.rpc('validate_and_use_access_code', {
        p_code: accessCode.trim(),
        p_user_email: email || null,
        p_ip_address: null,
        p_user_agent: navigator.userAgent || null
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; remaining_uses?: number };

      if (result.success) {
        toast({ title: "Access Granted" });
        setShowCodeDialog(false);
        if (onContinue) onContinue();
      } else {
        toast({
          title: "Invalid Code",
          description: result.error || "Please check your code and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Error",
        description: "Failed to validate access code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidatingCode(false);
      setAccessCode('');
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto border-2 border-green-100 bg-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/DYOTA_logo-removebg-preview.png" 
              alt="DYOTA Logo" 
              className="h-12 object-contain"
            />
          </div>
          <CardTitle>Thank You</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-700">
            You've been added to our waitlist. We'll contact you shortly with access to create your agent.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <span className="font-medium">{email}</span>
          </div>
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full"
            >
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-md mx-auto border-gray-200 shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/DYOTA_logo-removebg-preview.png" 
              alt="DYOTA Logo" 
              className="h-16 object-contain"
            />
          </div>
          <CardTitle>High Demand Notice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-gray-50 px-4 py-3 rounded-lg text-sm text-gray-700">
            Due to high demand, we've temporarily applied rate limits to our agent creation system. 
            Please provide your email to join our priority waitlist.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address *"
                required
                className="mb-1"
                disabled={isSubmitting}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="font-medium text-blue-800 mb-2">What happens next?</p>
              <ul className="text-blue-700 space-y-1">
                <li>• We'll contact you within 24 hours</li>
                <li>• Priority access to agent creation</li>
                <li>• Free setup assistance</li>
                <li>• No spam or unnecessary emails</li>
              </ul>
            </div>

            <div className="flex gap-3">
              {(onCancel || showBackButton) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Join Waitlist
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="pt-3 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Already have access?</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCodeDialog(true)}
                className="w-full hover:bg-gray-50"
                disabled={isSubmitting}
              >
                <Key className="w-4 h-4 mr-2" />
                Access by Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCodeDialog} onOpenChange={(open) => !open && setShowCodeDialog(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <img 
                src="/DYOTA_logo-removebg-preview.png" 
                alt="DYOTA Logo" 
                className="h-10 object-contain"
              />
            </div>
            <DialogTitle>Enter Access Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCodeSubmit} className="space-y-4 pt-2">
            <Input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter your access code"
              required
              className="text-center text-lg font-mono"
              disabled={isValidatingCode}
              maxLength={10}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCodeDialog(false)}
                disabled={isValidatingCode}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isValidatingCode}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isValidatingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Verify Code
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RateLimitWarning; 