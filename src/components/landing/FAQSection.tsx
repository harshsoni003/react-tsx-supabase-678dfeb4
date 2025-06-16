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
      question: "How long does it take?",
      answer: "Our voice agents can be set up and deployed within 24-48 hours after we have all the necessary information about your business needs and requirements."
    },
    {
      question: "Do you handle development too?",
      answer: "Yes, Framer or custom-coded frontend if needed. (React & tailwind stack)"
    },
    {
      question: "How do we start?",
      answer: "Getting started is simple. Book a consultation call with our team, and we'll guide you through the process of creating your custom voice agent tailored to your specific business needs."
    },
    {
      question: "Who do you work with?",
      answer: "We work with businesses of all sizes across various industries, including e-commerce, healthcare, education, finance, and professional services. Our solutions are particularly valuable for businesses looking to enhance customer engagement and streamline operations."
    },
    {
      question: "What's the payment like?",
      answer: "We offer flexible payment options including one-time setup fees and monthly subscription plans. The exact pricing depends on your specific requirements and the complexity of your voice agent solution."
    },
    {
      question: "Do you offer on-going support?",
      answer: "Yes, we provide comprehensive ongoing support for all our voice agent solutions. This includes technical support, performance monitoring, updates, and optimization to ensure your voice agent continues to deliver optimal results."
    },
    {
      question: "Are there refunds?",
      answer: "We offer a satisfaction guarantee. If you're not satisfied with your voice agent within the first 14 days after deployment, we'll work with you to address any issues or provide a refund according to our refund policy terms."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-background to-gray-50">
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