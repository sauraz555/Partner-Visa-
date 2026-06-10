import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Warning: Missing Supabase URL or Anon Key. The app will default to localStorage mock data.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://epbgtyipcndcmveekfpe.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export async function uploadFileToSupabase(
  projectId: string,
  fileId: string,
  file: File
): Promise<string | null> {
  if (!hasSupabaseConfig) return null;
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${fileId}.${fileExt}`;
    const filePath = `${projectId}/${fileName}`;

    // Upload to bucket 'evidence-vault'
    const { error: uploadError } = await supabase.storage
      .from('evidence-vault')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage.from('evidence-vault').getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err: any) {
    console.error('Supabase Storage Upload Error:', err.message);
    return null;
  }
}
