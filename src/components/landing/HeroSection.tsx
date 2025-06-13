
import { NewHeroSection } from './NewHeroSection';

interface HeroSectionProps {
  onCreateAgent: () => void;
  onTalkWithBot: () => void;
  isLoggedIn?: boolean;
  onSignOut?: () => void;
}

const HeroSection = ({ onCreateAgent, onTalkWithBot, isLoggedIn, onSignOut }: HeroSectionProps) => {
  return <NewHeroSection onCreateAgent={onCreateAgent} onTalkWithBot={onTalkWithBot} isLoggedIn={isLoggedIn} onSignOut={onSignOut} />;
};

export default HeroSection;
