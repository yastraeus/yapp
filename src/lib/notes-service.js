import { supabase } from './supabase'

// 获取当前用户ID
async function getCurrentUserId() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
    
    if (!user) {
      console.error('用户未登录')
      throw new Error('用户未登录')
    }
    
    console.log('获取到的用户信息:', user) // 添加日志
    return user.id
  } catch (error) {
    console.error('获取用户ID过程中出错:', error)
    throw error
  }
}

// 获取当前用户的笔记
export async function fetchNotes() {
  try {
    const userId = await getCurrentUserId()
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取笔记失败:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('获取用户笔记失败:', error)
    throw error
  }
}

// 创建新笔记
export async function createNote(text, title = '') {
  if (!text.trim()) {
    throw new Error('笔记内容不能为空')
  }

  try {
    const userId = await getCurrentUserId()
    console.log('当前用户ID:', userId) // 添加日志
    
    // 如果没有提供标题，自动从内容中提取前50个字符作为标题
    const noteTitle = title.trim() || text.trim().substring(0, 50) + (text.trim().length > 50 ? '...' : '')
    
    const { data, error } = await supabase
      .from('notes')
      .insert([{ 
        text, 
        title: noteTitle,
        user_id: userId 
      }])
      .select()

    if (error) {
      console.error('创建笔记失败:', error)
      throw error
    }

    console.log('创建的笔记:', data) // 添加日志
    return data[0]
  } catch (error) {
    console.error('创建笔记过程中出错:', error)
    throw error
  }
}

// 更新笔记
export async function updateNote(id, text, title = '') {
  if (!text.trim()) {
    throw new Error('笔记内容不能为空')
  }

  try {
    const userId = await getCurrentUserId()
    
    // 如果没有提供标题，自动从内容中提取前50个字符作为标题
    const noteTitle = title.trim() || text.trim().substring(0, 50) + (text.trim().length > 50 ? '...' : '')
    
    const { data, error } = await supabase
      .from('notes')
      .update({ 
        text, 
        title: noteTitle,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', userId)  // 确保只能更新自己的笔记
      .select()

    if (error) {
      console.error('更新笔记失败:', error)
      throw error
    }

    if (!data || data.length === 0) {
      throw new Error('未找到笔记或无权限更新')
    }

    return data[0]
  } catch (error) {
    console.error('更新笔记过程中出错:', error)
    throw error
  }
}

// 删除笔记
export async function deleteNote(id) {
  try {
    const userId = await getCurrentUserId()
    
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)  // 确保只能删除自己的笔记

    if (error) {
      console.error('删除笔记失败:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('删除笔记过程中出错:', error)
    throw error
  }
}