import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionClick = useCallback((sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const href = `#${sectionId}`;
    
    if (location.pathname !== '/') {
      // If not on home page, navigate there first with the hash
      navigate(`/${href}`);
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If already on home page, just scroll and update URL
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Update URL without page reload
        window.history.pushState({}, '', href);
      }
    }
  }, [location.pathname, navigate]);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      // If already on home page, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Update URL without the hash
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <footer className="bg-[#121212] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <a 
                href="/" 
                onClick={handleHomeClick}
                className="flex items-center hover:opacity-90 transition-opacity"
              >
                <img src="/favicon.ico" alt="Logo" className="w-20 h-20 mr-3" />
                <span className="text-xl font-bold text-white">Voice Bolt</span>
              </a>
            </div>
            <p className="text-gray-400 mb-6 max-w-md text-sm">
              We Build AI-First Sales Systems That Help You Scale Faster
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com/voiceboltai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6823 10.6218ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.0956Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Menu */}
          <div>
            <h3 className="text-base font-semibold mb-4">Menu</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="/" 
                  onClick={handleHomeClick}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#pricing" 
                  onClick={(e) => handleSectionClick('pricing', e)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a 
                  href="#cta" 
                  onClick={(e) => handleSectionClick('cta', e)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  CTA
                </a>
              </li>
              <li>
                <a 
                  href="#faqs" 
                  onClick={(e) => handleSectionClick('faqs', e)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Book a Call */}
          <div>
            <h3 className="text-base font-semibold mb-4">Book a Call</h3>
            <a 
              href="https://cal.com/voicebolt/15min" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Get started today with a free 15 min consult
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center md:text-left">
          <p className="text-gray-400 text-xs">
            <Link to="/copyright" className="hover:text-white transition-colors">
              © 2025 Smart Scaling AI, All Rights Reserved
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
