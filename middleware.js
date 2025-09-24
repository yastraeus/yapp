import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 获取当前会话
  const { data: { session } } = await supabase.auth.getSession()
  
  const { pathname } = request.nextUrl

  // 允许访问登录页面和静态资源
  if (pathname.startsWith('/login') || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api') ||
      pathname.startsWith('/favicon.ico')) {
    return response
  }

  // 如果用户未登录且不是访问登录页面，重定向到登录页面
  if (!session && pathname !== '/login') {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  // 如果用户已登录但访问登录页面，重定向到首页
  if (session && pathname === '/login') {
    const url = new URL('/', request.url)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}