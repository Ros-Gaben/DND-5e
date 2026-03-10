import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'OPENAI_API_KEY not configured' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Supabase configuration missing' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get userId from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '');
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError) {
        console.error('Auth error:', userError);
      }
      userId = user?.id || null;
    }

    const { race, characterClass } = await req.json();

    if (!race || !characterClass) {
      console.error('Missing required fields:', { race, characterClass });
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Race and class are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use a default folder if no userId
    const userFolder = userId || 'anonymous';

    console.log(`Generating avatar for ${race} ${characterClass}...`);

    const raceDescriptions: Record<string, string> = {
      'Human': 'a human with realistic features',
      'Elf': 'an elegant elf with pointed ears and graceful features',
      'Dwarf': 'a stout dwarf with a thick beard and strong features',
      'Halfling': 'a small halfling with cheerful features and curly hair',
      'Dragonborn': 'a dragonborn with scaled skin and draconic features',
      'Gnome': 'a small gnome with exaggerated features and curious eyes',
      'Half-Elf': 'a half-elf with subtle pointed ears and mixed human-elven features',
      'Half-Orc': 'a half-orc with greenish skin, tusks, and strong muscular features',
      'Tiefling': 'a tiefling with horns, reddish skin, and demonic features',
    };

    const classDescriptions: Record<string, string> = {
      'Fighter': 'wearing heavy armor with a sword and shield, battle-hardened warrior',
      'Wizard': 'wearing mystical robes holding a glowing staff, arcane symbols floating nearby',
      'Rogue': 'wearing dark leather armor with a hood, daggers at the belt, stealthy appearance',
      'Cleric': 'wearing holy vestments with a divine symbol, radiating holy light',
      'Ranger': 'wearing forest green leather with a bow, nature-themed accessories',
      'Paladin': 'wearing shining plate armor with a holy symbol, wielding a longsword',
      'Barbarian': 'with muscular build, tribal tattoos, wielding a massive axe',
      'Bard': 'wearing colorful performer clothes, holding a lute or musical instrument',
      'Druid': 'wearing natural robes with leaves and vines, connected to nature',
      'Monk': 'wearing simple robes, martial arts stance, inner peace visible',
      'Sorcerer': 'with magical energy crackling around them, innate power visible',
      'Warlock': 'with dark mystical energy, eldritch symbols, mysterious patron influence',
    };

    const raceDesc = raceDescriptions[race] || `a ${race.toLowerCase()}`;
    const classDesc = classDescriptions[characterClass] || `as a ${characterClass.toLowerCase()}`;

    const prompt = `Fantasy RPG character portrait of ${raceDesc} ${classDesc}. High quality digital art, detailed face portrait, dramatic lighting, fantasy style, suitable for a tabletop RPG character sheet. No text or watermarks.`;

    console.log('Generated prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    const data = await response.json();
    
    console.log('DALL-E response status:', response.status);

    if (!response.ok) {
      console.error('DALL-E error:', data.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: data.error?.message || 'Failed to generate avatar',
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tempImageUrl = data.data?.[0]?.url;

    if (!tempImageUrl) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No image URL returned from DALL-E',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Download the image from DALL-E
    console.log('Downloading image from DALL-E...');
    const imageResponse = await fetch(tempImageUrl);
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate unique filename
    const fileName = `${userFolder}/${crypto.randomUUID()}.png`;

    console.log('Uploading to Supabase Storage:', fileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to store avatar: ' + uploadError.message,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('Avatar stored successfully:', publicUrlData.publicUrl);

    return new Response(JSON.stringify({ 
      success: true, 
      avatarUrl: publicUrlData.publicUrl,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Avatar generation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
