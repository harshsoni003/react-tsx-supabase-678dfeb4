import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => {
  return (
    <div className="mb-6 overflow-hidden rounded-xl shadow-sm border border-gray-100">
      <button
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none bg-white text-gray-900 hover:bg-gray-50 transition-colors"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 bg-white text-gray-600 border-t border-gray-100">
              <p className="leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What types of AI Voice Agents do you offer?",
      answer: "We offer customizable AI voice agents for sales, customer support, appointment booking, lead qualification, and general business inquiries. Each agent is trained on your specific business knowledge."
    },
    {
      question: "Can I integrate this with my existing website?",
      answer: "Yes! Works with any platform - Framer, Webflow, WordPress, or Frontend Code."
    },
    {
      question: "How quickly can my AI voice agent be set up?",
      answer: "Basic package is ready within 24 hours with simple setup. Custom builds takes 5-7 business days depending on your specific agent requirements and customization needs."
    },
    
    {
      question: "Is there a contract or can I cancel anytime?",
      answer: "For the basic package, there is No cancellations allowed.For the premium packagem, You can cancel anytime."
    },
    {
      question: "How do I get started?",
      answer: "Book a consultation call with our team to discuss your custom voice agent tailored to your business needs."
    },
    
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-24 bg-gradient-to-b from-background to-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg">
            Everything you need to know about our voice agent solutions
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 