import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import HeroSection from '@/components/landing/HeroSection';

import Footer from '@/components/landing/Footer';
import TalkWithBotButton from '@/components/landing/TalkWithBotButton';
import VoiceChatModal from '@/components/landing/VoiceChatModal';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import CTA from '@/components/landing/CTA';
import { Mic } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const { profile, loading: profileLoading } = useUserProfile(user);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

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

  // Navigate to create-agent route if user just signed in
  useEffect(() => {
    if (searchParams.get('newSignIn') === 'true' && user) {
      navigate('/create-agent');
      // Remove the newSignIn parameter from URL
      navigate('/', { replace: true });
    }
  }, [searchParams, user, navigate]);

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
    // Navigate to the create agent page instead of showing a modal
    navigate('/create-agent');
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
      {/* Main Content */}
      <main>
        <HeroSection 
          onCreateAgent={handleCreateAgent}
          onTalkWithBot={handleTalkWithBot}
          isLoggedIn={!!user}
          onSignOut={handleSignOut}
        />
      
        <PricingSection onCreateAgent={handleCreateAgent} />
        <CTA onCreateAgent={handleCreateAgent} />
        <FAQSection />
        <Footer />
      </main>

      {/* Fixed Talk Button */}
      <TalkWithBotButton onClick={handleTalkWithBot} />

      {/* Voice Chat Modal */}
      <VoiceChatModal 
        isOpen={showVoiceChat}
        onClose={() => setShowVoiceChat(false)}
      />
    </div>
  );
};

export default Index;
