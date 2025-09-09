import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import clientPromise from './lib/mongodb';

export const runtime = 'nodejs';

const MONGODB_DB = process.env.MONGODB_DB || 'Muaca';
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || 'Links';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const client = await clientPromise;
    const db = client.db(MONGODB_DB);
    const collection = db.collection(MONGODB_COLLECTION);

    const link = await collection.findOne({ path: pathname });

    if (link && link.to) {
      return NextResponse.redirect(link.to);
    }
  } catch (error) {
    console.error("Middleware database error:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - admin (admin pages)
     * - favicon.ico (favicon file)
     * - / (the root page)
     */
    '/((?!api|_next/static|_next/image|admin|favicon.ico|$).+)',
  ],
};
