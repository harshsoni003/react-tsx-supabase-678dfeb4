import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface PricingSectionProps {
  onCreateAgent?: () => void;
}

interface Feature {
  name: string;
  starter: boolean | string;
  pro: boolean | string;
}

const PricingSection = ({ onCreateAgent }: PricingSectionProps) => {
  const [showComparison, setShowComparison] = useState(false);

  const features: Feature[] = [
    { name: 'Voice AI assistant', starter: "fixed setup", pro: "custom setup" },
    { name: 'Included call minutes', starter: "250 min(for 1 month)", pro: "1100 min(for 1 month)" },
    { name: 'Customization', starter: false, pro: "Fully customized" },
    { name: 'Call tracking', starter: false, pro: "Full analytics" },
    { name: 'Automation setup', starter: false, pro: "Complete setup" },
    { name: 'Implementation', starter: "Initial assistance", pro: "Full assistance" },
    { name: 'Support', starter: "Email only", pro: "Dedicated Slack" },
    { name: 'Post-launch support', starter: false, pro: "2 sessions" },
    { name: 'Logo branding', starter: "Voicebolt logo", pro: "Your logo" },
    { name: 'Analytics dashboard', starter: false, pro: "Comprehensive" },
    { name: 'Knowledge Base', starter: "Only website", pro: "Website, Social & Custom Business Knowledge, Online search" },
    { name: 'Voice', starter: false, pro: "Custom Voice" },
    { name: 'Cancellation policy', starter: false, pro: "Cancel anytime" }

  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            AI Voice Assistant Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the plan that works best for your business needs
          </p>
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-sm font-medium">Individual Plans</span>
            <Switch 
              checked={showComparison} 
              onCheckedChange={setShowComparison} 
              className="data-[state=checked]:bg-black"
            />
            <span className="text-sm font-medium">Compare Plans</span>
          </div>
        </div>

        {!showComparison ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto transition-all duration-500 ease-in-out">
            {/* Basic Plan */}
            <div className="bg-white text-gray-900 rounded-lg p-8 shadow-xl transform transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-bold">$500</span>
                <span className="text-gray-500 ml-2">/one-time</span>
              </div>
              <p className="text-gray-600 mb-8">
                Perfect for small businesses looking to try AI voice technology
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Preview AI Voice Assistant</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Initial assistance</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Basic email support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>250 minutes/month (Free for 1st month)</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Additional calls: $22/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Integration within 24 hours</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Voicebolt logo included</span>
                </li>
              </ul>
              
              <Button 
                variant="outline" 
                className="w-full border-black text-white bg-black hover:bg-gray-800 hover:text-white mb-4 flex items-center justify-center"
                onClick={() => window.open('https://cal.com/voicebolt/15min', '_blank')}
              >
                Book a Call
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white text-gray-900 rounded-lg p-8 shadow-xl transform transition-all duration-300 hover:-translate-y-2 border border-gray-200 relative">
              <div className="absolute top-4 right-4 bg-black text-white text-xs px-3 py-1 rounded-full">
                Most Popular
              </div>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-bold">$5000</span>
                <span className="text-gray-500 ml-2">/one-time</span>
              </div>
              <p className="text-gray-600 mb-8">
                For businesses that need a fully customized AI voice solution
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Fully customized AI voice assistant</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Complete business knowledge integration</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Call tracking and analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Full automation setup</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Dedicated Slack support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>1100 minutes/month (Free for 1st month)</span>
                </li>              
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Your personalized logo</span>
                </li>
              </ul>
              
              <Button 
                variant="outline" 
                className="w-full mb-4 bg-black hover:bg-gray-800 hover:text-white text-white flex items-center justify-center"
                onClick={() => window.open('https://cal.com/voicebolt/15min', '_blank')}
              >
                Book a Call
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto transition-all duration-500 ease-in-out">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-3">
                <div className="p-6 border-b border-gray-100">
                  <span className="text-2xl font-semibold">Features</span>
                </div>
                <div className="p-6 border-b border-gray-100 text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold">$500</span>
                    <span className="text-gray-500 ml-2 text-sm">/one-time</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Basic Package</div>
                </div>
                <div className="p-6 border-b border-gray-100 bg-gray-50 text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold">$5000</span>
                    <span className="text-gray-500 ml-2 text-sm">/one-time</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Premium Package</div>
                </div>
              </div>
              
              {features.map((feature, index) => (
                <div key={index} className="grid grid-cols-3 border-b border-gray-100">
                  <div className="p-5 flex items-center">
                    <span className="text-base">{feature.name}</span>
                  </div>
                  <div className="p-5 flex items-center justify-center">
                    {typeof feature.starter === 'string' ? (
                      <div className="flex items-center">
                        <Check className="h-5 w-5 mr-2 text-green-500" />
                        <span>{feature.starter}</span>
                      </div>
                    ) : feature.starter ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="p-5 flex items-center justify-center bg-gray-50">
                    {typeof feature.pro === 'string' ? (
                      <div className="flex items-center">
                        <Check className="h-5 w-5 mr-2 text-green-500" />
                        <span>{feature.pro}</span>
                      </div>
                    ) : feature.pro ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection; 