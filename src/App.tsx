import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useUserProfile } from "@/hooks/useUserProfile";
import Index from "./pages/Index";
import Calls from "./pages/Calls";
import Clients from "./pages/Clients";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardContent from "@/components/dashboard/DashboardContent";
import ElevenLabs from "./pages/ElevenLabs";
import AgentPage from "./pages/AgentPage";
import PricingPage from "./pages/PricingPage";
import { CreateAgentPage } from "./createagent";
import Copyright from "./components/landing/Copyright";

const App = () => {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  }), []);

  const [user, setUser] = useState<User | null>(null);
  const { profile } = useUserProfile(user);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Dashboard component with layout
  const Dashboard = () => {
    // If user is not authenticated, redirect to sign in
    if (!user) {
      return <Navigate to="/signin" replace />
    }
    
    return (
      <DashboardLayout user={user} profile={profile} onSignOut={handleSignOut}>
        <DashboardContent />
      </DashboardLayout>
    );
  };

  // Redirect component for external links
  const ExternalRedirect = ({ to }: { to: string }) => {
    useEffect(() => {
      window.location.href = to;
    }, [to]);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p>Redirecting to external site...</p>
        </div>
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calls" element={<Calls />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/elevenlabs" element={<ElevenLabs />} />
            <Route path="/agent/:agentId" element={<AgentPage />} />
            <Route path="/create-agent" element={<CreateAgentPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/signin112" element={<SignIn />} />
            <Route path="/signup112" element={<SignUp />} />
            <Route path="/forgot-password112" element={<ForgotPassword />} />
            <Route path="/reset-password112" element={<ResetPassword />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/copyright" element={<Copyright />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
