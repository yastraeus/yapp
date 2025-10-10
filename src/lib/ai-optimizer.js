// AI优化服务 - 通过API路由进行笔记智能优化

/**
 * 使用API路由对笔记内容进行智能优化
 * @param {string} content - 需要优化的笔记内容
 * @returns {Promise<string>} - 优化后的内容
 */
export async function optimizeNote(content) {
  if (!content || content.trim() === '') {
    throw new Error('笔记内容不能为空');
  }

  try {
    const response = await fetch('/api/optimize-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.optimizedContent) {
      throw new Error('优化结果为空');
    }

    return data.optimizedContent;
  } catch (error) {
    console.error('AI优化失败:', error);
    throw new Error(`AI优化服务暂时不可用: ${error.message}`);
  }
}

/**
 * 检查AI优化服务是否可用
 * @returns {Promise<boolean>}
 */
export async function checkAIServiceAvailability() {
  try {
    const response = await fetch('/api/optimize-note');
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.available === true;
  } catch (error) {
    return false;
  }
}