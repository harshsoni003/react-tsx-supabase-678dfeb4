
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User } from '@supabase/supabase-js';
import UserHeader from '@/components/UserHeader';
import AuthenticatedView from '@/components/AuthenticatedView';
import UnauthenticatedView from '@/components/UnauthenticatedView';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, loading: profileLoading } = useUserProfile(user);
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
            <UserHeader user={user} profile={profile} onSignOut={handleSignOut} />
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
            <AuthenticatedView user={user} profile={profile} />
          ) : (
            <UnauthenticatedView />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
