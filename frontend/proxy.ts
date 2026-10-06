import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const roomPath = request.url.match(/\/rooms\/([^/?#]+)/);
  if (!roomPath) return NextResponse.next();

  try {
    decodeURIComponent(roomPath[1]);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/rooms", request.url));
  }
}

export const config = {
  matcher: "/rooms/:id",
};
