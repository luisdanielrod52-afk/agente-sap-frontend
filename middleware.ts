import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de idiomas soportados
const locales = ['es', 'en'];
const defaultLocale = 'es';

// Función para obtener el idioma preferido del navegador
function getLocaleFromRequest(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const preferredLocale = acceptLanguage.split(',')[0]?.split('-')[0] || '';
  return locales.includes(preferredLocale) ? preferredLocale : defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si ya tiene un idioma en la URL
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Redirigir al idioma detectado
  const locale = getLocaleFromRequest(request);
  const newPath = `/${locale}${pathname}`;
  
  // No redirigir para archivos estáticos
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|json|webmanifest)$/)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = newPath;
  
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};