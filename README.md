Yes — you *can fetch your full call history directly from ElevenLabs* using your API key and the **History API**, then display it in your MVP dashboard. Here's how to do it:

---

## 📦 1. Using the History API Endpoint

### ✅ Endpoint for Conversational AI History:

```
GET https://api.elevenlabs.io/v1/convai/conversations
```

* Returns your recent **conversation history** with ElevenLabs AI agents
* Supports **pagination** with cursor-based navigation
* Response includes agent names, durations, message counts, and success evaluations

### ✅ Endpoint for General History:

```
GET https://api.elevenlabs.io/v1/history
```

* Returns your recent **history items** (TTS, speech, ConvAI calls)
* Supports **pagination** (default max 100 items/page) ([elevenlabs.io][1], [elevenlabs.io][2])

### Example request:

```bash
curl -H "xi-api-key: YOUR_API_KEY" \
  "https://api.elevenlabs.io/v1/convai/conversations?page_size=100&cursor=CURSOR"
```

* Each conversation includes:

  * `conversation_id`, `start_time_unix_secs`, `agent_name`, `call_duration_secs`
  * `message_count`, `call_successful`, `status`, etc.

---

## 🧱 2. Fetch Audio Files

Once you fetch the list, download audio via:

```
GET /v1/history/{history_item_id}/audio
```

You get back the binary audio file to save or display in `<audio>` tag ([postman.com][3])

Alternatively, use:

```
POST /v1/history/download
```

to download multiple items as a zip ([elevenlabs.io][4])

---

## 🔁 3. Workflow Summary

1. **Fetch** paginated conversation data from the Conversational AI endpoint
2. **Store** metadata (date, agent, duration, messages count, evaluation) in your Supabase `call_logs` table
3. **Download/upload** audio files to Supabase Storage for playback
4. **Display** conversation data and audio URLs in your dashboard

---

## 🧠 4. Putting It All Together — Example in Node.js

```js
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const API_KEY = process.env.ELEVEN_API_KEY;

async function syncConversationHistory() {
  let params = '?page_size=100';
  while (true) {
    const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations${params}`, {
      headers: { 'xi-api-key': API_KEY }
    });
    const { conversations, has_more, next_cursor } = await res.json();
    if (!conversations.length) break;

    for (const conversation of conversations) {
      const { 
        conversation_id, 
        start_time_unix_secs, 
        agent_name, 
        call_duration_secs, 
        message_count, 
        call_successful, 
        status 
      } = conversation;
      
      // Note: Audio download may not be available for all conversations
      // Use conversation_id to attempt audio download if available
      let audioUrl = null;
      try {
        const audioRes = await fetch(
          `https://api.elevenlabs.io/v1/history/${conversation_id}/audio`,
          { headers: { 'xi-api-key': API_KEY } }
        );
        if (audioRes.ok) {
          const buffer = await audioRes.buffer();
          const path = `${conversation_id}.mp3`;
          await supabase.storage
            .from('call-audio')
            .upload(path, buffer, { contentType: 'audio/mpeg' });
          const { publicUrl } = supabase.storage.from('call-audio').getPublicUrl(path);
          audioUrl = publicUrl;
        }
      } catch (audioError) {
        console.log('Audio not available for this conversation');
      }

      // store metadata
      await supabase.from('call_logs').insert({
        id: conversation_id,
        timestamp: new Date(start_time_unix_secs * 1000),
        agent_name,
        duration_seconds: call_duration_secs,
        messages_count: message_count,
        evaluation_result: call_successful,
        status,
        audio_url: audioUrl
      });
    }

    // pagination with cursor
    if (!has_more) break;
    params = `?page_size=100&cursor=${next_cursor}`;
  }
}
```

---

## ⚙️ 5. Automate with Webhooks (Optional)

To keep your dashboard updated automatically:

1. **Enable "Post-call webhooks"** in ElevenLabs settings ([elevenlabs.io][5])
2. They'll send a webhook payload (transcript, audio metadata, conversation ID) to your server
3. In your webhook handler, **download the audio**, **upload it to Supabase**, and **insert metadata**

---

## ✅ Wrap-Up

* **Yes**, you can pull your conversation history via `/v1/history/conversational-ai` + pagination
* Download audio with `/audio` or batch via `/download` ([postman.com][3])
* Store transcripts, audio URLs and metadata in Supabase
* Display in your dashboard with React + `<audio>` players

---

## 📋 Implementation Details

We've implemented the ElevenLabs conversation history integration in this project. Here's what's included:

### 🔧 Features

- **API Key Management**: Securely store your ElevenLabs API key in your user profile
- **Conversation History Display**: View all your ElevenLabs conversations in a searchable, filterable table
- **Audio Playback**: Stream audio directly in the dashboard
- **Persistent Storage**: Conversation data and audio files are stored in Supabase for fast access
- **Pagination**: Load more conversations as needed with "Load More" functionality
- **Conversational AI Metrics**: View important metrics like duration, messages count, and evaluation results

### 🛠️ How to Use

1. Navigate to **Settings** > **Integrations** tab
2. Enter your ElevenLabs API key and save
3. Go to the **Calls** section to view your conversation history
4. Use the search and filters to find specific conversations
5. Play audio directly in the dashboard

### 📁 Project Structure

- `src/services/elevenlabs.ts` - ElevenLabs API integration
- `src/services/callLogs.ts` - Supabase call logs management
- `src/components/calls/CallsContent.tsx` - Conversation history UI component
- `src/components/settings/SettingsContent.tsx` - API key management UI
- `supabase/migrations/20240606000000_create_call_logs_table.sql` - Database schema

### 📚 Documentation

For detailed instructions, see [ElevenLabs Integration Guide](./docs/ElevenLabsIntegration.md)

---

🧠 **Next Steps**:

* Want a complete React + Node starter?
* Need help enabling webhooks and building secure listeners?
  Just let me know your preferred stack and I'll scaffold it for you 🔧

[1]: https://elevenlabs.io/docs/api-reference/history/get/~explorer?utm_source=chatgpt.com "Get history item | ElevenLabs Documentation"
[2]: https://elevenlabs.io/blog/history-api-supports-pagination?utm_source=chatgpt.com "GET history items endpoint API supports pagination - ElevenLabs"
[3]: https://www.postman.com/elevenlabs/elevenlabs/documentation/7i9rytu/elevenlabs-api-documentation?utm_source=chatgpt.com "ElevenLabs API Documentation Documentation - Postman"
[4]: https://elevenlabs.io/docs/api-reference/history/download?utm_source=chatgpt.com "Download history items | ElevenLabs Documentation"
[5]: https://elevenlabs.io/docs/conversational-ai/workflows/post-call-webhooks?utm_source=chatgpt.com "Post-call webhooks | ElevenLabs Documentation"
[6]: https://elevenlabs.io/docs/conversational-ai/libraries/java-script?utm_source=chatgpt.com "JavaScript SDK | ElevenLabs Documentation"
