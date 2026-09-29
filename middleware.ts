import { NextResponse, type NextRequest } from "next/server";

// Protege /admin com Basic Auth usando ADMIN_PASSWORD do ambiente.
// Usuário fixo: "admin". Sem ADMIN_PASSWORD definido, o painel fica
// bloqueado (nunca aceita), pra não deixar aberto por engano.
export function middleware(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (expected && scheme === "Basic" && encoded) {
    try {
      const [user, pass] = atob(encoded).split(":");
      if (user === "admin" && pass === expected) {
        return NextResponse.next();
      }
    } catch {
      // ignore, fallthrough para desafio
    }
  }
  return new NextResponse("Autenticação necessária.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Painel de leads"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
