'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // 处理表单输入变化
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // 清除错误信息
    if (error) setError('')
  }, [error])

  // 处理登录提交
  const handleLogin = useCallback(async (e) => {
    e.preventDefault()
    
    // 表单验证
    if (!formData.email || !formData.password) {
      setError('请填写邮箱和密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (authError) {
        setError(authError.message)
        return
      }

      // 登录成功，重定向到主页面
      console.log('登录成功:', data)
      router.push('/')
      
    } catch (err) {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [formData, router])

  // 表单字段配置
  const formFields = [
    {
      id: 'email',
      label: '邮箱地址',
      type: 'email',
      placeholder: '请输入邮箱',
      required: true
    },
    {
      id: 'password',
      label: '密码',
      type: 'password',
      placeholder: '请输入密码',
      required: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="max-w-md w-full space-y-8 mt-8 sm:mt-12">
        {/* 页面标题区域 */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-blue-600 dark:text-blue-300 font-bold">🔐</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">登录到 Yapp</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">请输入您的凭据继续</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {formFields.map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                value={formData[field.id]}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={field.placeholder}
                required={field.required}
                disabled={loading}
              />
            </div>
          ))}

          {/* 错误信息显示 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}