'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 获取会话的异步函数
  const getSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('获取会话失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 处理认证状态变化的回调
  const handleAuthChange = useCallback((event, session) => {
    setUser(session?.user ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      if (!mounted) return
      
      await getSession()

      // 监听认证状态变化
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

      return () => {
        mounted = false
        subscription.unsubscribe()
      }
    }

    const cleanup = initializeAuth()
    
    return () => {
      mounted = false
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [getSession, handleAuthChange])

  // 退出登录函数
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      // 退出登录后重定向到登录页面
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }, [])

  // 优化上下文值，避免不必要的重渲染
  const value = {
    user,
    signOut,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}