import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

const Streaks = () => {
  const [user, setUser] = useState(null)
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStreakData()
  }, [])

  const loadStreakData = async () => {
    setLoading(true)
    
    // Get authenticated user
    const { data: { user: authUser } } 
      = await supabase.auth.getUser()
    
    if (!authUser) {
      setLoading(false)
      return
    }
    
    // Get user profile from database
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single()
    
    if (!profile) {
      setLoading(false)
      return
    }
    
    setUser(profile)
    
    // Get user's badges
    const { data: badgesData } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', profile.id)
    
    setBadges(badgesData || [])
    
    setLoading(false)
  }

  // Calculate this month days
  const getThisMonthDays = () => {
    if (!user?.last_activity_date) return 0
    
    const today = new Date()
    const lastActivity = new Date(
      user.last_activity_date
    )
    
    if (today.getMonth() === lastActivity.getMonth() 
        && today.getFullYear() === lastActivity.getFullYear()) {
      return Math.min(
        user.streak_count || 0,
        today.getDate()
      )
    }
    
    return 0
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex flex-row gap-2">
          <div className="animate-pulse 
            bg-gray-300 w-12 h-12 
            rounded-full">
          </div>
          <div className="flex flex-col gap-2">
            <div className="animate-pulse 
              bg-gray-300 w-28 h-5 
              rounded-full">
            </div>
            <div className="animate-pulse 
              bg-gray-300 w-36 h-5 
              rounded-full">
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentStreak = user?.streak_count || 0
  const longestStreak = user?.longest_streak || 0
  const thisMonthDays = getThisMonthDays()

  return (
    <div className="p-8">
      
      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl 
          p-12 mb-8 text-center"
      >
        <div className="text-6xl mb-4">
          {currentStreak > 0 ? '🔥' : '🌱'}
        </div>
        
        <h1 className="text-5xl font-bold mb-4">
          {currentStreak} Day Streak!
        </h1>
        
        <p className="text-gray-600">
          {currentStreak === 0 && 
            'Login daily to start your streak!'}
          {currentStreak === 1 && 
            'Great start! Login tomorrow to continue!'}
          {currentStreak > 1 && currentStreak < 7 && 
            `You're on fire! Keep it going!`}
          {currentStreak >= 7 && 
            'You are unstoppable! Amazing dedication!'}
        </p>
      </motion.div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        
        {/* Current Streak */}
        <div className="bg-white rounded-2xl p-6">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-sm text-gray-500">
            CURRENT STREAK
          </div>
          <div className="text-3xl font-bold">
            {currentStreak} days
          </div>
        </div>
        
        {/* Longest Streak */}
        <div className="bg-white rounded-2xl p-6">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-sm text-gray-500">
            LONGEST STREAK
          </div>
          <div className="text-3xl font-bold">
            {longestStreak} days
          </div>
        </div>
        
        {/* Total Active */}
        <div className="bg-white rounded-2xl p-6">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-sm text-gray-500">
            TOTAL ACTIVE DAYS
          </div>
          <div className="text-3xl font-bold">
            {currentStreak} days
          </div>
        </div>
        
        {/* This Month */}
        <div className="bg-white rounded-2xl p-6">
          <div className="text-3xl mb-2">📆</div>
          <div className="text-sm text-gray-500">
            THIS MONTH
          </div>
          <div className="text-3xl font-bold">
            {thisMonthDays} / 31 days
          </div>
        </div>
        
      </div>

      {/* BADGES */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Your Badges 🏅
        </h2>
        
        {badges.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-gray-600">
              Start logging actions daily to earn badges!
            </p>
            <p className="text-sm text-gray-400 mt-2">
              First badge unlocks at 7 day streak
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {badges.map(badge => (
              <div key={badge.id}
                className="bg-gradient-to-br 
                  from-yellow-100 to-yellow-200 
                  rounded-xl p-4">
                <div className="text-4xl mb-2">
                  {badge.badge_icon}
                </div>
                <h3 className="font-bold">
                  {badge.badge_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {badge.badge_description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  )
}

export default Streaks
