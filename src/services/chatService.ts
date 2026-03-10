import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface InventoryItem {
  item_name: string;
  item_type: string;
  quantity: number;
  equipped: boolean;
}

export interface CharacterContext {
  name: string;
  race: string;
  class: string;
  background?: string;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hit_points: number;
  max_hit_points: number;
  experience: number;
  avatar_url?: string | null;
  inventory?: InventoryItem[];
}

export const sendChatMessage = async (
  messages: ChatMessage[],
  characterContext?: CharacterContext,
  conversationId?: string
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { 
        messages,
        characterContext,
        conversationId
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.message;
  } catch (error) {
    console.error('Chat service error:', error);
    throw error;
  }
};
