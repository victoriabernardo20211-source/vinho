import { sql } from "@vercel/postgres";
import { ensureSchema, type Lead } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function fetchLeads(): Promise<Lead[]> {
  await ensureSchema();
  const { rows } = await sql<Lead>`
    SELECT id, name, phone, phone_digits, score, total, ip, user_agent, created_at
    FROM leads
    ORDER BY created_at DESC
    LIMIT 500
  `;
  return rows;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

export default async function AdminPage() {
  let leads: Lead[] = [];
  let error: string | null = null;
  try {
    leads = await fetchLeads();
  } catch (err) {
    console.error("[admin] fetch leads failed", err);
    error =
      "Não foi possível ler o banco. Verifique se o Postgres está conectado ao projeto no Vercel.";
  }

  return (
    <main className="admin">
      <h1>Leads</h1>
      <p className="muted">
        {leads.length} contato{leads.length === 1 ? "" : "s"} registrado
        {leads.length === 1 ? "" : "s"}.
      </p>

      {error ? (
        <div className="empty">{error}</div>
      ) : leads.length === 0 ? (
        <div className="empty">
          Nenhum lead ainda. Quando alguém completar o quiz e enviar o
          formulário, aparece aqui.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Quando</th>
              <th>Nome</th>
              <th>WhatsApp</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{formatDate(lead.created_at)}</td>
                <td>{lead.name}</td>
                <td>
                  <a
                    href={`https://wa.me/${lead.phone_digits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lead.phone}
                  </a>
                </td>
                <td>
                  {lead.score ?? "—"}
                  {lead.total ? ` / ${lead.total}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
