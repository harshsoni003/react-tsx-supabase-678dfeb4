# Agent Creation System

This module provides a complete system for creating AI voice agents with ElevenLabs integration.

## Components

### CreateAgentForm
A form component for collecting agent creation details.

**Required fields:**
- Email address
- Company name  
- Website URL

**Optional fields:**
- Agent name (auto-generated if empty)

**Usage:**
```tsx
import { CreateAgentForm } from '@/createagent';

const MyComponent = () => {
  const handleSuccess = (agentId: string) => {
    console.log('Agent created:', agentId);
  };

  return (
    <CreateAgentForm 
      onSuccess={handleSuccess}
      onCancel={() => console.log('Cancelled')}
    />
  );
};
```

### CreateAgentPage
A standalone page component that wraps the form.

**Usage:**
```tsx
import { CreateAgentPage } from '@/createagent';

// Use as a page component
<CreateAgentPage />
```

### CreateAgentModal (Updated)
The existing modal now uses the new form system.

### TalkToAgent
A voice chat component that allows real-time conversation with a created agent.

**Usage:**
```tsx
import { TalkToAgent } from '@/createagent';

<TalkToAgent 
  agentId="agent_123..." 
  agentName="Support Assistant"
  companyName="My Company"
  websiteUrl="https://mycompany.com"
  onBack={() => console.log('Back')}
/>
```

### CreateAndTalkToAgent
A combined component that handles the full flow: create agent → immediately talk to it.

**Usage:**
```tsx
import { CreateAndTalkToAgent } from '@/createagent';

// Complete flow in one component
<CreateAndTalkToAgent />
```

## Services

### agentCreationService
Handles all ElevenLabs API interactions for agent management.

**Functions:**
- `createAgent(data)` - Creates a new agent
- `getAgentDetails(agentId)` - Fetches agent details
- `listAgents()` - Lists all agents
- `updateAgent(agentId, updates)` - Updates agent configuration
- `deleteAgent(agentId)` - Deletes an agent

**Usage:**
```tsx
import { createAgent, AgentCreationData } from '@/createagent';

const data: AgentCreationData = {
  email: 'user@company.com',
  companyName: 'My Company',
  websiteUrl: 'https://mycompany.com',
  agentName: 'Support Assistant'
};

try {
  const agentId = await createAgent(data);
  console.log('Created agent:', agentId);
} catch (error) {
  console.error('Failed to create agent:', error);
}
```

## Features

### Automatic Agent Configuration
- Generates comprehensive agent prompts based on company information
- Creates appropriate first messages
- Sets up proper conversation flow

### Automatic Knowledge Base Integration
- Automatically adds website URL to agent's knowledge base
- Agent can answer questions about your company using website content
- Seamless integration with ElevenLabs Knowledge Base API

### Real-Time Voice Chat
- Connect directly to your created agent
- Voice-to-voice conversation using ElevenLabs ConvAI
- Agent uses its knowledge base during conversations
- Real-time audio streaming and response

### Error Handling
- Validates form inputs
- Handles ElevenLabs API errors gracefully
- Provides user-friendly error messages

### Form Validation
- Email format validation
- URL format validation
- Required field validation

### ElevenLabs Integration
- Uses existing API key management
- Follows ElevenLabs ConvAI API specifications
- Handles authentication and rate limiting
- Connects to specific agent IDs for personalized conversations

## Requirements

1. **ElevenLabs API Key**: Must be configured in user settings
2. **Supabase Session**: User must be logged in
3. **UI Components**: Uses existing shadcn/ui components

## Generated Agent Prompt Structure

The system automatically generates comprehensive agent prompts including:

1. **Company Information**: Name, website, contact details
2. **Agent Role**: Professional customer service representative
3. **Guidelines**: Behavioral instructions and best practices
4. **Greeting**: Personalized introduction message
5. **Escalation**: Instructions for handling complex queries

## Error Handling

The system handles various error scenarios:

- Invalid API keys
- Network connectivity issues
- Rate limiting
- Invalid form data
- ElevenLabs service errors

All errors are logged and presented to users with actionable messages.

## Development

To extend the system:

1. **Add new fields**: Update `AgentCreationData` interface and form
2. **Customize prompts**: Modify `generateAgentPrompt()` function
3. **Add validation**: Extend `validateForm()` method
4. **Handle new API endpoints**: Add functions to service file

## Testing

To test agent creation:

1. Ensure ElevenLabs API key is configured
2. Fill out the form with valid data
3. Check console for agent ID and logs
4. Verify agent appears in ElevenLabs dashboard

## Troubleshooting

**"No ElevenLabs API key found"**
- Check user settings and ensure API key is saved

**"Invalid request parameters"**
- Verify all required fields are filled correctly
- Check URL format (should include protocol)

**"Rate limit exceeded"**
- Wait a few minutes before retrying
- Consider upgrading ElevenLabs subscription

**"Access denied"**
- Verify API key has correct permissions
- Check ElevenLabs subscription status 