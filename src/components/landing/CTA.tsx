import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CTAProps {
  onCreateAgent?: () => void;
}

const CTA = ({ onCreateAgent }: CTAProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onCreateAgent) {
      onCreateAgent();
    } else {
      navigate('/create-agent');
    }
  };
  
  return (
    <section id="cta" className="py-20 bg-white text-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">
          Ready to try Voice Bolt?
        </h2>
        
        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
          Build your AI voice agent in within minutes.
        </p>
        
        <Button 
          onClick={handleClick}
          size="lg" 
          className="bg-black hover:bg-gray-800 text-white font-medium px-8 py-3 text-lg rounded-md transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Build Your Agent <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

export default CTA; 