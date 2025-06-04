
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/signin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Our App</h1>
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">
                  {user.user_metadata?.username || user.email}
                </span>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-x-2">
              <Link to="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {user ? (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome back!</CardTitle>
                <CardDescription>
                  You are successfully signed in to your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Username:</strong> {user.user_metadata?.username || 'Not set'}</p>
                      <p><strong>Account created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                      <p><strong>Email verified:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  
                  {!user.email_confirmed_at && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        <strong>Please verify your email:</strong> Check your inbox for a verification email to complete your account setup.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
