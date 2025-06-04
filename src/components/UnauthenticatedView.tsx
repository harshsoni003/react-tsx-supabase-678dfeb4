
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const UnauthenticatedView = () => {
  return (
    <div className="text-center space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Get Started Today</CardTitle>
          <CardDescription>
            Join thousands of users who trust our secure authentication system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">New User?</h3>
              <p className="text-gray-600 text-sm">
                Create your account with email verification and secure password requirements.
              </p>
              <Link to="/signup">
                <Button className="w-full" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Existing User?</h3>
              <p className="text-gray-600 text-sm">
                Sign in to your account or reset your password if you've forgotten it.
              </p>
              <Link to="/signin">
                <Button variant="outline" className="w-full" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="pt-6 border-t">
            <h3 className="font-semibold text-lg mb-4">Features</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Secure Authentication</h4>
                <p className="text-blue-700">Industry-standard security with email verification</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Google Sign-In</h4>
                <p className="text-green-700">Quick and easy authentication with your Google account</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Password Recovery</h4>
                <p className="text-purple-700">Easy password reset via email verification</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthenticatedView;
