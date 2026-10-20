import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase-config.js';

let clientPromise;

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  if (!clientPromise) {
    clientPromise = import('https://esm.sh/@supabase/supabase-js@2')
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY))
      .catch((error) => {
        clientPromise = null;
        throw new Error(`No se pudo cargar Supabase: ${error.message}`);
      });
  }
  return clientPromise;
}

export async function getPublicWeddingGuest(token) {
  const client = await getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.rpc('get_public_wedding_guest', {
    invitation_token: token
  });
  if (error) throw error;
  return data;
}

export async function submitPublicWeddingRsvp(token, status, attendees, comment) {
  const client = await getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.rpc('submit_public_wedding_rsvp', {
    invitation_token: token,
    response_status: status,
    attendees,
    guest_comment: comment
  });
  if (error) throw error;
  return data;
}
