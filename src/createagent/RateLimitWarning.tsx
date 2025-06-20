import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Mail, Clock, CheckCircle, AlertTriangle, Loader2, Key, Lock } from 'lucide-react';
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      // Save email to Supabase
      const { error } = await supabase
        .from('waitlist_emails')
        .insert([
          {
            email: email.trim().toLowerCase(),
            created_at: new Date().toISOString(),
            status: 'pending'
          }
        ]);

      if (error) {
        // If the email already exists, that's fine - just show success
        if (error.code === '23505') { // Unique violation
          console.log('Email already exists in waitlist');
        } else {
          throw error;
        }
      }

      setIsSubmitted(true);
      toast({
        title: "Email Saved Successfully!",
        description: "We'll contact you soon with access to create your agent.",
      });

    } catch (error) {
      console.error('Error saving email:', error);
      toast({
        title: "Error Saving Email",
        description: "There was an issue saving your email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccessByCode = () => {
    setShowCodeDialog(true);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter the access code.",
        variant: "destructive"
      });
      return;
    }

    setIsValidatingCode(true);

    try {
      // Use Supabase function to validate and use the access code
      const { data, error } = await supabase.rpc('validate_and_use_access_code', {
        p_code: accessCode.trim(),
        p_user_email: email || null,
        p_ip_address: null,
        p_user_agent: navigator.userAgent || null
      });

      if (error) {
        console.error('Error validating access code:', error);
        toast({
          title: "Validation Error",
          description: "There was an error validating your code. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const result = data as { success: boolean; error?: string; remaining_uses?: number };

      if (result.success) {
        toast({
          title: "Access Granted!",
          description: result.remaining_uses !== undefined 
            ? `Code verified! ${result.remaining_uses} uses remaining.`
            : "Redirecting to agent creation form...",
        });
        setShowCodeDialog(false);
        if (onContinue) {
          onContinue();
        }
      } else {
        toast({
          title: "Invalid Code",
          description: result.error || "The access code you entered is incorrect. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Validation Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidatingCode(false);
      setAccessCode('');
    }
  };

  const handleCloseCodeDialog = () => {
    setShowCodeDialog(false);
    setAccessCode('');
    setIsValidatingCode(false);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-800">You're on the Waitlist!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-green-700">
              Thank you for your interest! We've saved your email address and will contact you soon with access to create your voice agent.
            </p>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">{email}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-green-600">
              <p>✅ Email saved successfully</p>
              <p>✅ You'll receive priority access</p>
              <p>✅ No spam, just updates</p>
            </div>
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="w-full border-green-300 text-green-700 hover:bg-green-100"
              >
                Close
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl">High Demand Notice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Due to high demand, we've temporarily applied rate limits to our agent creation system. 
                Please provide your email to join our priority waitlist.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="waitlist-email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="waitlist-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">What happens next?</h4>
                <ul className="text-xs text-blue-700 space-y-1">
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
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
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

            {/* Access by Code Section */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Already have access?</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAccessByCode}
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  disabled={isSubmitting}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Access by Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={handleCloseCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span>Enter Access Code</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <Label htmlFor="access-code" className="text-sm font-medium text-gray-700">
                Access Code *
              </Label>
              <Input
                id="access-code"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter your access code"
                required
                className="mt-1 text-center text-lg font-mono"
                disabled={isValidatingCode}
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 4-digit access code you received
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCodeDialog}
                disabled={isValidatingCode}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isValidatingCode}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isValidatingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
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