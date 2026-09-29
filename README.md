# Quiz do Vinho

Quiz estático de 4 perguntas com tela final de "Resgatar Desconto".
HTML/CSS/JS puros, sem build.

## Rodar localmente

Qualquer servidor estático serve. Exemplos:

```bash
# Python 3
python3 -m http.server 5173

# Node
npx serve .
```

Abra <http://localhost:5173>.

## Deploy no Vercel

1. Faça push do repositório para o GitHub (já está apontado para
   `victoriabernardo20211-source/vinho`, branch `claude/funny-gauss-dvh42c`).
2. Em <https://vercel.com/new>, importe o repositório.
3. Framework Preset: **Other** (é site estático).
4. Root Directory: `.` — deixe o padrão.
5. Build Command: deixe **vazio**.
6. Output Directory: deixe **vazio** (o Vercel serve os arquivos da raiz).
7. Deploy.

Também dá para instalar a CLI e rodar `vercel` na raiz do projeto —
ela pergunta e cria o projeto.

## Personalizar

- Perguntas e resposta certa: array `QUESTIONS` em `script.js`.
- Link do botão final: constante `CHECKOUT_URL` em `script.js`.
- Cores da marca: variáveis `--brand*` em `styles.css`.
- Nome no topo: `<span class="brand-name">` em `index.html`.
- Banner: SVG inline em `index.html` (troque por `<img src="banner.png">`
  se preferir usar uma imagem sua — coloque o arquivo na raiz).
