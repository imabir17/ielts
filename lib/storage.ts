import { supabase } from './supabase';

/**
 * Upload an audio file to Supabase Storage bucket and return the public URL.
 * Automatically tries 'audio' and 'media' buckets, and falls back to a self-contained Data URL if needed.
 */
export async function uploadAudioFile(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'mp3';
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `audio_${Date.now()}_${cleanName}`;

  try {
    // 1. Try 'audio' bucket
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!error && data) {
      const { data: urlData } = supabase.storage.from('audio').getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        return urlData.publicUrl;
      }
    }

    // 2. Try 'media' bucket
    const { data: mData, error: mError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!mError && mData) {
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        return urlData.publicUrl;
      }
    }
  } catch (e) {
    console.warn('Supabase storage upload failed, using Data URL fallback:', e);
  }

  // 3. Fallback to Data URL
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve((ev.target?.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
