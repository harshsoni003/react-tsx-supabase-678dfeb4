
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Headphones, 
  ShoppingCart, 
  Building, 
  GraduationCap,
  Heart,
  Briefcase
} from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Automate customer service with intelligent voice agents that handle inquiries, complaints, and support tickets 24/7.",
      benefits: ["Reduced wait times", "Consistent responses", "Cost-effective scaling"]
    },
    {
      icon: ShoppingCart,
      title: "Sales & Lead Generation",
      description: "Engage prospects, qualify leads, and drive sales with personalized voice interactions that convert.",
      benefits: ["Higher conversion rates", "Lead qualification", "Sales automation"]
    },
    {
      icon: Building,
      title: "Enterprise Solutions",
      description: "Custom voice agent solutions for large organizations with complex requirements and integration needs.",
      benefits: ["Custom integrations", "Enterprise security", "Dedicated support"]
    },
    {
      icon: GraduationCap,
      title: "Educational Assistance",
      description: "Interactive voice tutors and educational assistants that help students learn and teachers manage classrooms.",
      benefits: ["Personalized learning", "24/7 availability", "Progress tracking"]
    },
    {
      icon: Heart,
      title: "Healthcare Support",
      description: "HIPAA-compliant voice agents for patient engagement, appointment scheduling, and health monitoring.",
      benefits: ["Patient engagement", "Appointment automation", "Health reminders"]
    },
    {
      icon: Briefcase,
      title: "Professional Services",
      description: "Voice agents for consultants, lawyers, accountants, and other professionals to handle client communications.",
      benefits: ["Client communication", "Appointment booking", "Information gathering"]
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Solutions for Every{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Industry
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Voice Bolt adapts to your industry's unique needs, providing specialized solutions that drive results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </CardDescription>
                  <div className="space-y-2">
                    {service.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center text-sm text-gray-500">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
