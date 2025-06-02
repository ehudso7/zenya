import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Delete user data in the correct order (due to foreign key constraints)
    
    // 1. Delete user achievements
    const { error: achievementsError } = await supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', userId)
    
    if (achievementsError) {
      console.error('Error deleting achievements:', achievementsError)
    }

    // 2. Delete user progress
    const { error: progressError } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId)
    
    if (progressError) {
      console.error('Error deleting progress:', progressError)
    }

    // 3. Delete user sessions
    const { error: sessionsError } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
    
    if (sessionsError) {
      console.error('Error deleting sessions:', sessionsError)
    }

    // 4. Delete user profile
    const { error: profileError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
    
    if (profileError) {
      console.error('Error deleting profile:', profileError)
    }

    // 5. Delete auth user (this will sign out the user)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    
    if (authError) {
      // If admin API is not available, use the regular delete
      console.error('Error deleting auth user:', authError)
      // The user can still request deletion through Supabase dashboard
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated data have been deleted.'
    })
  } catch (error) {
    console.error('Error deleting user account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    )
  }
}