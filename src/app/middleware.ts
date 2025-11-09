import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

export async function middleware(request: Request) {
  const session = await getServerSession(authOptions);
  const { pathname } = new URL(request.url);

  // Proteger rutas de trabajador
  if (pathname.startsWith('/trabajador')) {
    if (!session || session.user.role !== 'TRABAJADOR') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!(session.user as any).verified) {
      return NextResponse.redirect(new URL('/verificar', request.url));
    }
  }
    if (pathname.startsWith("/trabajador/perfil")) {
    if (!session || session.user.role !== "TRABAJADOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  // Proteger rutas de cliente
  if (pathname.startsWith('/cliente')) {
    if (!session || session.user.role !== 'CLIENTE') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!(session.user as any).verified) {
      return NextResponse.redirect(new URL('/verificar', request.url));
    }
  }
  
  if (pathname.startsWith("/cliente/postear")) {
    if (!session || session.user.role !== "CLIENTE" || !session.user.verified) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protege admin
  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  return NextResponse.next();
  
}

export const config = {
  matcher: ['/trabajador/:path*', '/cliente/:path*', '/admin/:path*'],
};