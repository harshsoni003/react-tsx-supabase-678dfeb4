
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface SignUpSuccessScreenProps {
  email: string;
}

const SignUpSuccessScreen = ({ email }: SignUpSuccessScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
          <CardDescription className="text-gray-600">
            We've sent you a verification link at <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Click the link in your email to verify your account and complete the signup process.
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Resend verification email
            </Button>
            <Link to="/signin">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpSuccessScreen;
