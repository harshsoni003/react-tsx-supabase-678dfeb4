
import { CreateAgentWithChatModal } from '@/createagent';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAgentModal = ({ isOpen, onClose }: CreateAgentModalProps) => {
  return (
    <CreateAgentWithChatModal 
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default CreateAgentModal;
