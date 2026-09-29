import { NextResponse, type NextRequest } from "next/server";

// Protege o painel de leads. O CAMINHO do painel é definido pela env
// ADMIN_PATH (só está no Vercel, nunca no repositório). Além disso,
// pede Basic Auth com senha ADMIN_PASSWORD (usuário fixo: "admin").
// Sem alguma dessas envs, o painel nunca é servido.
export function middleware(request: NextRequest) {
  const adminPath = process.env.ADMIN_PATH;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPath || !adminPassword) return NextResponse.next();

  const pathname = request.nextUrl.pathname.replace(/^\/+/, "");
  if (pathname !== adminPath) return NextResponse.next();

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

// Roda em qualquer rota da app, exceto assets internos e /api/*.
export const config = {
  matcher: ["/((?!_next/|api/|favicon|kit-evino).*)"],
};
