
import { Button } from '@/components/ui/button';
import { Mic, Play, Sparkles } from 'lucide-react';

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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-blue-600 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Voice Technology
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Meet{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Voice Bolt
            </span>
          </h1>
          
          <h2 className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Your AI voice assistant that understands, responds, and adapts to your needs in real-time
          </h2>
          
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Transform your business communication with intelligent voice agents that provide 24/7 support, 
            handle customer inquiries, and deliver personalized experiences at scale.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            onClick={onCreateAgent}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Mic className="w-5 h-5 mr-2" />
            Create Your Voice Agent
          </Button>
          
          <Button
            onClick={onTalkWithBot}
            variant="outline"
            size="lg"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
          >
            <Play className="w-5 h-5 mr-2" />
            Try Live Demo
          </Button>
        </div>

        {/* Demo preview */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <p className="text-gray-600 font-medium">Interactive Voice Agent Preview</p>
                <p className="text-gray-500 text-sm mt-2">Click "Try Live Demo" to experience Voice Bolt</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
