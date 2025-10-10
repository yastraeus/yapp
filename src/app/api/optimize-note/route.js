import { NextResponse } from 'next/server';

// 系统提示词 - 精简版本
const SYSTEM_PROMPT = '你是一个笔记优化助手。请优化用户提供的笔记内容，包括语法检查、结构优化和表达精炼，保持原意不变。直接返回优化后的内容。';

export async function POST(request) {
  try {
    // 解析请求体
    const { content } = await request.json();
    
    if (!content?.trim()) {
      return NextResponse.json(
        { error: '笔记内容不能为空' },
        { status: 400 }
      );
    }

    // 获取配置
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';
    const apiUrl = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
    const model = process.env.OPENROUTER_MODEL || 'z-ai/glm-4.5-air:free';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API密钥未配置' },
        { status: 500 }
      );
    }

    // 调用OpenRouter API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `优化笔记：${content}` }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      // 简化错误处理
      let errorMessage = `API请求失败: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // 忽略解析错误
      }
      
      // 降级方案
      if (response.status >= 500) {
        return NextResponse.json({
          optimizedContent: `[模拟优化] ${content}`
        });
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // 解析响应
    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json(
        { error: 'API返回数据格式错误' },
        { status: 500 }
      );
    }

    const optimizedContent = data.choices[0].message.content.trim();
    
    return NextResponse.json({ 
      optimizedContent: optimizedContent || content 
    });
  } catch (error) {
    // 降级到模拟响应
    try {
      const { content } = await request.json();
      return NextResponse.json({
        optimizedContent: `[模拟优化] ${content}`
      });
    } catch {
      return NextResponse.json(
        { error: '请求处理失败' },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  return NextResponse.json({ 
    available: !!apiKey 
  });
}