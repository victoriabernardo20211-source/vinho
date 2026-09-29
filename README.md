# Quiz do Vinho

App Next.js (App Router, TypeScript) que hospeda um quiz curto e captura
leads em **Vercel Postgres**. Ao final do quiz, a pessoa preenche
nome e WhatsApp; o registro vai pro banco e o WhatsApp do consultor
abre com uma mensagem pré-preenchida.

## Rodar localmente

```bash
pnpm install        # ou npm install
pnpm dev            # http://localhost:3000
```

Para o `/api/leads` funcionar local, exporte `POSTGRES_URL` apontando
para um banco Postgres (o próprio Vercel Postgres funciona: pegue a
URL em `Storage → seu banco → .env.local`).

## Deploy no Vercel

1. Importe o repositório em <https://vercel.com/new>. O Vercel detecta
   Next.js sozinho — não precisa configurar build nem output.
2. **Storage → Create Database → Postgres**, e conecte ao projeto.
   As variáveis `POSTGRES_URL` etc. são injetadas automaticamente.
3. **Project Settings → Environment Variables:**
   - `ADMIN_PATH` — caminho do painel de leads, sem barra. Uma string
     longa e aleatória que só você sabe (ex.: `9uji8sdfhjuhioa`). É a
     URL do painel: `https://seu-site.vercel.app/<ADMIN_PATH>`.
   - `ADMIN_PASSWORD` — senha do painel (usuário fixo: `admin`).
   - `NEXT_PUBLIC_CONSULTANT_PHONE` — WhatsApp do consultor no formato
     internacional só com dígitos (ex.: `5511999999999`).
   - `NEXT_PUBLIC_CONSULTANT_GREETING` — mensagem que abre no WhatsApp.
4. **Redeploy**. Pronto.

Sem `ADMIN_PATH` ou `ADMIN_PASSWORD` definidos, o painel simplesmente
não existe (qualquer URL retorna 404). Isso é proposital — evita
deixar aberto por engano.

## Painel

O painel fica em `/<ADMIN_PATH>`. Guarde essa URL no seu gerenciador de
senhas — ela não aparece no código nem no repositório, só na env var
do Vercel. Se o valor vazar, você troca a env, redeploya e a URL antiga
volta a ser 404 imediatamente.

## Estrutura

```
app/
  layout.tsx        shell + fontes
  page.tsx          página do quiz
  globals.css       estilos
  banner.tsx        SVG do topo
  quiz.tsx          client component com toda a lógica do quiz
  api/leads/route.ts   POST cria lead; roda schema-migration idempotente
  [secret]/page.tsx catch-all: só serve o painel se o path bater com
                    ADMIN_PATH; qualquer outra URL vira 404
lib/db.ts           `ensureSchema()` que cria a tabela se não existir
middleware.ts       Basic Auth quando o path bate com ADMIN_PATH
public/kit-evino.webp   imagem do combo mostrada na tela de resgate
```

## Banco

Uma única tabela, criada automaticamente na primeira chamada da API:

```sql
CREATE TABLE leads (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT        NOT NULL,
  phone        TEXT        NOT NULL,
  phone_digits TEXT        NOT NULL,
  score        INTEGER,
  total        INTEGER,
  ip           TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

`phone_digits` guarda a versão só-dígitos pra formar o link
`wa.me/<phone_digits>` do painel sem re-normalizar.

## Personalizar

- Perguntas e resposta certa: array `QUESTIONS` em `app/quiz.tsx`.
- Título do combo, imagem e alt: objeto `REWARD` em `app/quiz.tsx`.
- Cores da marca: variáveis `--brand*` em `app/globals.css`.
- Banner: `app/banner.tsx` (SVG inline — troque por um `<Image>` se
  preferir usar uma foto sua colocada em `public/`).
