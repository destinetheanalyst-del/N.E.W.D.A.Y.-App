import { supabase } from '../lib/supabase'

export const login = async (phone, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    phone,
    password
  })
  if (error) throw error
  return data
}
