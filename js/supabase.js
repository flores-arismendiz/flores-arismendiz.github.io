import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase-config.js';

let clientPromise;

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  if (!clientPromise) {
    clientPromise = import('https://esm.sh/@supabase/supabase-js@2')
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }))
      .catch((error) => {
        clientPromise = null;
        throw new Error(`No se pudo cargar Supabase: ${error.message}`);
      });
  }
  return clientPromise;
}

export async function uploadWeddingMusic(file) {
  if (!(file instanceof File)) throw new Error('Selecciona un archivo MP3.');
  if (!/\.mp3$/i.test(file.name) || (file.type && file.type !== 'audio/mpeg')) {
    throw new Error('El archivo debe estar en formato MP3.');
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('El archivo MP3 no puede superar los 20 MB.');
  }

  const client = await getSupabaseClient();
  if (!client) throw new Error('Supabase no está configurado.');

  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Conecta tu cuenta de Supabase antes de subir la canción.');

  const storagePath = `${user.id}/wedding-music.mp3`;
  const { error: uploadError } = await client.storage
    .from('wedding-media')
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType: 'audio/mpeg',
      upsert: true
    });
  if (uploadError) {
    throw new Error(`No se pudo subir el MP3. Verifica que esté aplicada la migración de almacenamiento: ${uploadError.message}`);
  }

  const { data } = client.storage.from('wedding-media').getPublicUrl(storagePath);
  if (!data?.publicUrl) throw new Error('Supabase no devolvió el enlace público de la canción.');
  return data.publicUrl;
}

export async function getPublicWeddingGuest(token) {
  const client = await getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.rpc('get_public_wedding_guest', {
    invitation_token: token
  });
  if (error) throw error;
  if (!data || Array.isArray(data) || typeof data !== 'object') {
    throw new Error('No se encontró la invitación en Supabase.');
  }
  return data;
}

export async function getPublicWeddingSettings() {
  const client = await getSupabaseClient();
  if (!client) throw new Error('Supabase no está configurado.');
  const { data, error } = await client.rpc('get_public_wedding_settings');
  if (error) throw error;
  if (!data || Array.isArray(data) || typeof data !== 'object') {
    throw new Error('No hay una configuración pública de boda en Supabase.');
  }
  return data;
}

export async function submitPublicWeddingRsvp(token, status, attendees, comment) {
  const client = await getSupabaseClient();
  if (!client) throw new Error('Supabase no está configurado.');
  const { data, error } = await client.rpc('submit_public_wedding_rsvp', {
    invitation_token: token,
    response_status: status,
    attendees,
    guest_comment: comment
  });
  if (error) throw error;
  return data;
}
