import { supabase } from '@/integrations/supabase/client';
import { CallHistoryItem } from './elevenlabs';

// Interface for call logs stored in Supabase
export interface CallLog {
  id: string;
  user_id: string;
  history_item_id: string;
  voice_id?: string;
  voice_name?: string;
  transcript: string;
  audio_url?: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  status: string;
  client_name: string;
  created_at: string;
  agent_name?: string;
  messages_count?: number;
  evaluation_result?: string;
}

// Save a call log to Supabase
export const saveCallLog = async (
  callItem: CallHistoryItem
): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No user session found');
      return false;
    }
    
    const { error } = await supabase
      .from('call_logs')
      .insert({
        id: callItem.id,
        user_id: session.user.id,
        history_item_id: callItem.id,
        voice_id: callItem.voice_id || null,
        voice_name: callItem.client,
        transcript: callItem.notes,
        audio_url: callItem.audio_url || null,
        date: callItem.date,
        time: callItem.time,
        duration: callItem.duration,
        type: callItem.type,
        status: callItem.status,
        client_name: callItem.client,
        agent_name: callItem.agent_name || null,
        messages_count: callItem.messages_count || null,
        evaluation_result: callItem.evaluation_result || null
      });
    
    if (error) {
      console.error('Error saving call log:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving call log:', error);
    return false;
  }
};

// Get all call logs for the current user
export const getCallLogs = async (): Promise<CallLog[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No user session found');
      return [];
    }
    
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching call logs:', error);
      return [];
    }
    
    return data as CallLog[];
  } catch (error) {
    console.error('Error fetching call logs:', error);
    return [];
  }
};

// Update a call log with audio URL
export const updateCallLogAudio = async (
  historyItemId: string,
  audioUrl: string
): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No user session found');
      return false;
    }
    
    const { error } = await supabase
      .from('call_logs')
      .update({ audio_url: audioUrl })
      .eq('history_item_id', historyItemId)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error updating call log audio:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating call log audio:', error);
    return false;
  }
};

// Delete a call log
export const deleteCallLog = async (historyItemId: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No user session found');
      return false;
    }
    
    // First delete the audio file if it exists
    const { data } = await supabase
      .from('call_logs')
      .select('audio_url')
      .eq('history_item_id', historyItemId)
      .eq('user_id', session.user.id)
      .single();
    
    if (data?.audio_url) {
      const audioPath = data.audio_url.split('/').pop();
      if (audioPath) {
        await supabase.storage.from('call-audio').remove([audioPath]);
      }
    }
    
    // Then delete the log entry
    const { error } = await supabase
      .from('call_logs')
      .delete()
      .eq('history_item_id', historyItemId)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error deleting call log:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting call log:', error);
    return false;
  }
}; 