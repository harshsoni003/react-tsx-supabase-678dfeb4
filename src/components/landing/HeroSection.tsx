
import { Button } from '@/components/ui/button';
import { Mic, Play, Sparkles } from 'lucide-react';
import { Hero195 } from '@/components/ui/hero-195';

interface HeroSectionProps {
  onCreateAgent: () => void;
  onTalkWithBot: () => void;
}

const HeroSection = ({ onCreateAgent, onTalkWithBot }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full">
        <Hero195 />
      </div>
    </section>
  );
};

export default HeroSection;
