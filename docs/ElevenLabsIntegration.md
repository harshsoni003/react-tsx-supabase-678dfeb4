# ElevenLabs Integration

This document explains how the ElevenLabs Conversational AI integration works in the application.

## Overview

The application integrates with ElevenLabs' Conversational AI platform to fetch and display conversation history. This includes voice conversations, call duration, message counts, and evaluation results.

## API Endpoints Used

### Conversational AI Conversations
- **Endpoint**: `/v1/convai/conversations`
- **Purpose**: Fetch conversation history from ElevenLabs Conversational AI
- **Response**: Contains conversation metadata including agent names, durations, message counts, and success evaluations

### History Audio
- **Endpoint**: `/v1/history/{history_item_id}/audio`
- **Purpose**: Download audio files for playback
- **Response**: Audio blob data

## Implementation Details

### Service Layer (`src/services/elevenlabs.ts`)

#### Key Functions:
- `fetchElevenLabsConvAIHistory()`: Fetches conversational AI history using the correct `/v1/convai/conversations` endpoint
- `convertToConvAICallHistory()`: Transforms ConvAI conversation data into the application's call history format
- `downloadHistoryItemAudio()`: Downloads audio for specific conversations
- `uploadAudioToSupabase()`: Stores audio in Supabase for persistent access

#### Data Transformation:
The ConvAI API returns conversation data in this format:
```json
{
  "conversations": [
    {
      "agent_id": "string",
      "conversation_id": "string", 
      "start_time_unix_secs": 1234567890,
      "call_duration_secs": 60,
      "message_count": 12,
      "status": "completed",
      "call_successful": "success",
      "agent_name": "Dyota AI Landing Page agent"
    }
  ],
  "has_more": true,
  "next_cursor": "cursor_string"
}
```

This is transformed into:
```json
{
  "id": "conversation_id",
  "client": "agent_name",
  "date": "Jun 13, 2025",
  "time": "4:11 PM", 
  "duration": "0:09",
  "type": "ConvAI",
  "status": "completed",
  "messages_count": 12,
  "evaluation_result": "Successful"
}
```

### UI Components (`src/components/calls/CallsContent.tsx`)

#### Features:
- **Data Display**: Shows Date/Time, Agent, Duration, Messages, and Evaluation columns
- **Search & Filter**: Filter by status, type, and search terms
- **Audio Playback**: Play conversation audio directly in the browser
- **Pagination**: Load more conversations using cursor-based pagination
- **Delete Functionality**: Remove conversation records

#### Table Columns:
1. **Date/Time**: Formatted conversation start time
2. **Agent**: Agent name from the conversation
3. **Duration**: Call duration in MM:SS format
4. **Messages**: Number of messages exchanged
5. **Evaluation**: Success/failure status with color coding

### Settings Integration (`src/components/settings/SettingsContent.tsx`)

#### API Key Management:
- Secure storage in Supabase user metadata
- Show/hide toggle for API key input
- Validation and test functionality

## Database Schema

### Call Logs Table (`supabase/migrations/`)
```sql
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  client_name TEXT,
  agent_name TEXT,
  phone_number TEXT,
  email TEXT,
  call_date DATE,
  call_time TIME,
  duration TEXT,
  call_type TEXT,
  status TEXT,
  notes TEXT,
  audio_url TEXT,
  messages_count INTEGER,
  evaluation_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage Instructions

### 1. Setup API Key
1. Go to Settings → ElevenLabs Integration
2. Enter your ElevenLabs API key
3. Click "Save & Test" to validate

### 2. Fetch Conversation History
1. Navigate to Voice History section
2. Click "Refresh" to fetch latest conversations
3. Use search and filters to find specific conversations

### 3. Play Audio
1. Click the play button in any conversation row
2. Audio will be downloaded and played automatically
3. Audio is cached in Supabase for future playback

### 4. Manage Data
1. Delete unwanted conversation records
2. Use pagination to load more conversations
3. Filter by ConvAI type to see only voice conversations

## Error Handling

### Common Issues:
1. **Invalid API Key**: Check Settings and verify key is correct
2. **No Conversations**: Ensure you have ConvAI conversations in your ElevenLabs account
3. **Audio Playback**: Some conversations may not have audio available

### Fallback Behavior:
- Shows fallback data if API fails
- Graceful error messages for user guidance
- Persistent storage to maintain data across sessions

## API Rate Limits

ElevenLabs API has rate limits based on subscription tier:
- Free: Limited requests per month
- Paid: Higher rate limits based on plan

The application includes error handling for rate limit responses.

## Testing

Use the provided test script (`test-elevenlabs.js`) to verify API connectivity:

1. Add your API key to the script
2. Run: `node test-elevenlabs.js`
3. Check console output for API response structure

This helps verify the endpoint is working correctly before using in the application. 