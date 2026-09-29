import { NextResponse, type NextRequest } from "next/server";

// Basic Auth para o painel (`/<ADMIN_PATH>`) e para GET /api/track,
// que o painel usa para puxar as sessões ao vivo. POST /api/track e
// POST /api/leads seguem públicos: são chamados pelo próprio quiz.
export function middleware(request: NextRequest) {
  const adminPath = process.env.ADMIN_PATH;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return NextResponse.next();

  const pathname = request.nextUrl.pathname.replace(/^\/+/, "");
  const isAdminPath = adminPath && pathname === adminPath;
  const isAdminApi =
    pathname === "api/track" && request.method === "GET";

  if (!isAdminPath && !isAdminApi) return NextResponse.next();

  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    try {
      const [user, pass] = atob(encoded).split(":");
      if (user === "admin" && pass === adminPassword) {
        return NextResponse.next();
      }
    } catch {
      // credencial inválida — cai no desafio
    }
  }
  return new NextResponse("Autenticação necessária.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Painel"',
    },
  });
}

export const config = {
  matcher: [
    "/api/track",
    "/((?!_next/|api/|favicon|kit-evino).*)",
  ],
};
