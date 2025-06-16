import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface PricingSectionProps {
  onCreateAgent?: () => void;
}

const PricingSection = ({ onCreateAgent }: PricingSectionProps) => {
  const [showComparison, setShowComparison] = useState(false);

  const features = [
    { name: 'Basic Analytics', starter: true, pro: true },
    { name: 'Up to 5 team members', starter: true, pro: true },
    { name: 'Basic support', starter: true, pro: true },
    { name: 'Advanced Analytics', starter: false, pro: true },
    { name: 'Up to 20 team members', starter: false, pro: true },
    { name: 'Priority support', starter: false, pro: true },
    { name: 'Custom integrations', starter: true, pro: true },
    { name: 'Unlimited team members', starter: true, pro: true },
    { name: '24/7 phone support', starter: true, pro: true },
  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple & Transparent Pricing
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
                Perfect for small businesses looking to establish an online presence
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Single Voice Agent</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Basic customization</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>5 hours of call time</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Email support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Analytics dashboard</span>
                </li>
              </ul>
              
              <Button 
                className="w-full mb-3 bg-black hover:bg-gray-800 text-white"
                onClick={onCreateAgent}
              >
                Get Started
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-black text-black hover:bg-gray-100"
              >
                Or Book a Call
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
                For businesses that need advanced features and dedicated support
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Multiple Voice Agents</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Advanced customization</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Unlimited call time</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-black" />
                  <span>Advanced analytics & reporting</span>
                </li>
              </ul>
              
              <Button 
                className="w-full mb-3 bg-black hover:bg-gray-800 text-white"
                onClick={onCreateAgent}
              >
                Get Started
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-black text-black hover:bg-gray-100"
              >
                Or Book a Call
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto transition-all duration-500 ease-in-out">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-3">
                <div className="p-6  border-b border-gray-100">
                  <span className="text-2xl font-semibold">Features</span>
                </div>
                <div className="p-6 border-b border-gray-100 text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold">$500</span>
                    <span className="text-gray-500 ml-2 text-sm">/one-time</span>
                  </div>
                </div>
                <div className="p-6 border-b border-gray-100 bg-gray-50 text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold">$5000</span>
                    <span className="text-gray-500 ml-2 text-sm">/one-time</span>
                  </div>
                </div>
              </div>
              
              {features.map((feature, index) => (
                <div key={index} className="grid grid-cols-3 border-b border-gray-100">
                  <div className="p-5 flex items-center">
                    <span className="text-base">{feature.name}</span>
                  </div>
                  <div className="p-5 flex items-center justify-center">
                    {feature.starter ? (
                      <Check className="h-5 w-5 text-blue-500" />
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </div>
                  <div className="p-5 flex items-center justify-center bg-gray-50">
                    {feature.pro ? (
                      <Check className="h-5 w-5 text-blue-500" />
                    ) : (
                      <span className="text-gray-300">-</span>
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