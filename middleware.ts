import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // ログインページへのアクセスは常に許可
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  // 認証チェック（実際のプロダクションではセキュアなセッション管理を使用すべき）
  const isAuthenticated = request.cookies.get('authenticated')?.value === 'true'

  // 未認証の場合はログインページにリダイレクト
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// ミドルウェアを適用するパスの設定
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}