
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MessageSquare, 
  BarChart3, 
  Clock, 
  Shield, 
  Zap,
  Users,
  Brain,
  Globe
} from 'lucide-react';

interface FeaturesSectionProps {
  onCreateAgent: () => void;
}

const FeaturesSection = ({ onCreateAgent }: FeaturesSectionProps) => {
  const features = [
    {
      icon: Mic,
      title: "Create Your Own Voice Agent",
      description: "Build custom voice agents tailored to your business needs with our intuitive no-code platform.",
      action: true
    },
    {
      icon: MessageSquare,
      title: "Real-Time Interaction",
      description: "Engage with customers through natural conversations with instant response times and human-like interactions.",
      action: false
    },
    {
      icon: BarChart3,
      title: "Custom Dashboard",
      description: "Monitor agent performance, view detailed transcripts, and analyze conversation insights in real-time.",
      action: false
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Your voice agents work around the clock, providing consistent support whenever your customers need it.",
      action: false
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and compliance with industry standards to keep your data safe and secure.",
      action: false
    },
    {
      icon: Zap,
      title: "Lightning Fast Setup",
      description: "Deploy your voice agent in minutes, not weeks. No technical expertise required.",
      action: false
    },
    {
      icon: Users,
      title: "Multi-Language Support",
      description: "Communicate with customers in their preferred language with built-in translation capabilities.",
      action: false
    },
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced natural language processing ensures your agent understands context and intent.",
      action: false
    },
    {
      icon: Globe,
      title: "Global Scalability",
      description: "Handle thousands of concurrent conversations across multiple time zones and regions.",
      action: false
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Modern Businesses
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create, deploy, and manage intelligent voice agents that deliver exceptional customer experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  {feature.action && (
                    <Button
                      onClick={onCreateAgent}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6 py-2 font-semibold transition-all duration-300"
                    >
                      Get Started
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
