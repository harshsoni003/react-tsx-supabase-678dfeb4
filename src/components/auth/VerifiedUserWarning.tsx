
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

const VerifiedUserWarning = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Account Already Exists</CardTitle>
          <CardDescription className="text-gray-600">
            An account with this email address already exists.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            It looks like you already have an account. Please sign in instead.
          </p>
          <div className="space-y-2">
            <Link to="/signin">
              <Button className="w-full">
                Sign In to Your Account
              </Button>
            </Link>
            <Link to="/forgot-password">
              <Button variant="outline" className="w-full">
                Forgot Password?
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifiedUserWarning;
