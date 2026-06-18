import { supabase } from './supabase'

/**
 * Update user's streak on login
 * Call this after successful login
 */
export const updateStreakOnLogin = async () => {
  try {
    // Get current auth user
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) return null
    
    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single()
    
    if (!profile) return null
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    
    const lastActivity = profile.last_activity_date
    
    let newStreak = profile.streak_count || 0
    let newLongest = profile.longest_streak || 0
    
    // First time user (no previous activity)
    if (!lastActivity) {
      newStreak = 1
    } else {
      const lastDate = new Date(lastActivity)
      lastDate.setHours(0, 0, 0, 0)
      
      const diffTime = today - lastDate
      const diffDays = Math.floor(
        diffTime / (1000 * 60 * 60 * 24)
      )
      
      if (diffDays === 0) {
        // Already logged in today
        // Streak stays same
        return {
          streak: newStreak,
          longest: newLongest,
          updated: false
        }
      } else if (diffDays === 1) {
        // Yesterday was last login
        // Continue streak!
        newStreak = newStreak + 1
      } else {
        // 2+ days gap, streak broken
        // Reset to 1 (logged in today)
        newStreak = 1
      }
    }
    
    // Update longest if needed
    if (newStreak > newLongest) {
      newLongest = newStreak
    }
    
    // Save to database
    const { error } = await supabase
      .from('users')
      .update({
        streak_count: newStreak,
        longest_streak: newLongest,
        last_activity_date: todayStr,
        last_active: new Date().toISOString()
      })
      .eq('id', profile.id)
    
    if (error) {
      console.error('Streak update error:', error)
      return null
    }
    
    return {
      streak: newStreak,
      longest: newLongest,
      updated: true
    }
    
  } catch (error) {
    console.error('Streak error:', error)
    return null
  }
}

/**
 * Get current streak status
 */
export const getStreakStatus = async () => {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) return null
  
  const { data: profile } = await supabase
    .from('users')
    .select('streak_count, longest_streak, last_activity_date')
    .eq('auth_id', authUser.id)
    .single()
  
  if (!profile) return null
  
  // Check if streak is at risk
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let isAtRisk = false
  let isBroken = false
  
  if (profile.last_activity_date) {
    const lastDate = new Date(profile.last_activity_date)
    lastDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor(
      (today - lastDate) / (1000 * 60 * 60 * 24)
    )
    
    if (diffDays === 1) {
      isAtRisk = true 
      // User needs to login today
    } else if (diffDays >= 2) {
      isBroken = true 
      // Streak is broken
    }
  }
  
  return {
    current: profile.streak_count || 0,
    longest: profile.longest_streak || 0,
    lastLogin: profile.last_activity_date,
    isAtRisk,
    isBroken
  }
}
