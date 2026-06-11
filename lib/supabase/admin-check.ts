import { createClient } from './server'

/**
 * Verifica si el usuario actual es admin
 * @returns {user, isAdmin} - El usuario y si es admin
 */
export async function checkAdmin() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { user: null, isAdmin: false }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { user, isAdmin: false }
    }

    return { user, isAdmin: profile.is_admin === true }
  } catch (err) {
    console.error('[checkAdmin] Error:', err)
    return { user: null, isAdmin: false }
  }
}
