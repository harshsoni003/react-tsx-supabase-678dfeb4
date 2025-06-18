import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Copyright = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Copyright Notice</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">© 2025 Voice Bolt</h2>
            <p className="text-gray-700">
              All content on this website, including but not limited to text, graphics, logos, 
              images, audio clips, digital downloads, data compilations, and software, is the 
              property of Smart Scaling AI or its content suppliers and is protected by international 
              copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">All Rights Reserved</h2>
            <p className="text-gray-700">
              The compilation of all content on this site is the exclusive property of Smart Scaling AI 
              and is protected by international copyright laws. All software used on this site is the 
              property of Smart Scaling AI or its software suppliers and is protected by international 
              copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Unauthorized Use</h2>
            <p className="text-gray-700">
              Unauthorized use of this website may give rise to a claim for damages and/or be a 
              criminal offense. Permission is granted to electronically copy and print hard copy 
              portions of this site for the sole purpose of placing an order with Smart Scaling AI 
              or purchasing Smart Scaling AI products.
            </p>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Button 
            onClick={() => navigate(-1)} 
            className="bg-black hover:bg-black-600"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Copyright; 