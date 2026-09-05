import { isSupabaseConfigured, supabase } from './supabase'

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase 환경변수가 설정되지 않았어요.')
  }
}

function unwrap(data) {
  if (Array.isArray(data)) return data[0] ?? null
  return data
}

export async function loginAdmin(adminId, password) {
  requireSupabase()
  const cleanId = String(adminId || '').trim()
  const email = cleanId.includes('@') ? cleanId : `${cleanId}@moca.local`

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  const { data: me, error: meError } = await supabase.rpc('moca_admin_me')
  if (meError) {
    await supabase.auth.signOut()
    throw meError
  }

  const profile = unwrap(me)
  if (!profile?.isAdmin) {
    await supabase.auth.signOut()
    throw new Error('운영진 권한이 없는 계정이에요.')
  }

  return { user: data.user, profile }
}

export async function getAdminSession() {
  if (!isSupabaseConfigured || !supabase) return null
  const { data } = await supabase.auth.getSession()
  if (!data.session) return null

  const { data: me, error } = await supabase.rpc('moca_admin_me')
  if (error) return null
  const profile = unwrap(me)
  return profile?.isAdmin ? { session: data.session, profile } : null
}

export async function logoutAdmin() {
  if (supabase) await supabase.auth.signOut()
}

export async function lookupParticipant(studentId) {
  requireSupabase()
  const { data, error } = await supabase.rpc('moca_admin_lookup_participant_v2', {
    p_student_id: String(studentId || '').trim(),
  })
  if (error) throw error
  return unwrap(data)
}

export async function listParticipants(query = '') {
  requireSupabase()
  const { data, error } = await supabase.rpc('moca_admin_list_participants_v2', {
    p_query: String(query || '').trim(),
  })
  if (error) throw error
  return data || []
}

export async function getDashboardStats() {
  requireSupabase()
  const { data, error } = await supabase.rpc('moca_admin_dashboard_stats')
  if (error) throw error
  return unwrap(data)
}
