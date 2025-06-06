
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ServicesSection from '@/components/landing/ServicesSection';
import Footer from '@/components/landing/Footer';
import TalkWithBotButton from '@/components/landing/TalkWithBotButton';
import CreateAgentModal from '@/components/landing/CreateAgentModal';
import VoiceChatModal from '@/components/landing/VoiceChatModal';
import { Mic } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
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

  const handleCreateAgent = () => {
    if (user) {
      // If user is logged in, go to dashboard or agent creation page
      navigate('/clients');
    } else {
      // If not logged in, show modal
      setShowCreateModal(true);
    }
  };

  const handleTalkWithBot = () => {
    setShowVoiceChat(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  // We no longer automatically redirect to dashboard when user is signed in

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Voice Bolt</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="outline" className="rounded-full">Dashboard</Button>
                  </Link>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline" 
                    className="rounded-full"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <Button variant="outline" className="rounded-full">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <HeroSection 
          onCreateAgent={handleCreateAgent}
          onTalkWithBot={handleTalkWithBot}
        />
        <FeaturesSection onCreateAgent={handleCreateAgent} />
        <ServicesSection />
        <Footer />
      </main>

      {/* Fixed Talk Button */}
      <TalkWithBotButton onClick={handleTalkWithBot} />

      {/* Modals */}
      <CreateAgentModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <VoiceChatModal 
        isOpen={showVoiceChat}
        onClose={() => setShowVoiceChat(false)}
      />
    </div>
  );
};

export default Index;
