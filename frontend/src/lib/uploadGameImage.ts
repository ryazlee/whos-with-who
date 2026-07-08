import { supabase } from './supabaseClient'

export async function uploadGamePersonImage(
  userId: string,
  personId: string,
  dataUrl: string,
): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured')

  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg'
  const path = `${userId}/${personId}.${ext}`

  const { error } = await supabase.storage.from('game-images').upload(path, blob, {
    upsert: true,
    contentType: blob.type || 'image/jpeg',
  })
  if (error) throw error

  const { data } = supabase.storage.from('game-images').getPublicUrl(path)
  return data.publicUrl
}
