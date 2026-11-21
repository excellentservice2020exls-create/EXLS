import { requireRole } from "@/lib/erp-auth";
import { db } from "@/prisma/db";
import { approveAccountAccess, rejectAccountAccess } from "./actions";

export const dynamic = "force-dynamic";

const statusMessages: Record<string, { text: string; tone: string }> = {
  approved: {
    text: "La demande a été approuvée. L’accès est autorisé pour cette session.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  rejected: {
    text: "La demande a été refusée.",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  "invalid-request": {
    text: "La demande sélectionnée est invalide.",
    tone: "border-red-200 bg-red-50 text-red-800",
  },
  "request-not-found": {
    text: "Cette demande n’existe plus.",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  "request-already-decided": {
    text: "Cette demande a déjà été traitée par un administrateur.",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  "account-inactive": {
    text: "Le compte associé n’est pas actif. Sa demande ne peut pas être approuvée.",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  "self-approval": {
    text: "Un SUPER_ADMIN ne peut pas approuver sa propre demande.",
    tone: "border-red-200 bg-red-50 text-red-800",
  },
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(["SUPER_ADMIN"]);
  const { status } = await searchParams;
  const message = typeof status === "string" ? statusMessages[status] : undefined;

  const [pendingRequests, recentDecisions] = await Promise.all([
    db.orm.public.SecurityAccessRequest
      .where({ status: "PENDING" })
      .orderBy((request) => request.requestedAt.asc())
      .include("user", (user) =>
        user.select("firstName", "lastName", "email", "role"),
      )
      .limit(100)
      .all(),
    db.orm.public.SecurityAccessRequest
      .where((request) => request.decidedAt.isNotNull())
      .orderBy((request) => request.decidedAt.desc())
      .include("user", (user) =>
        user.select("firstName", "lastName", "email"),
      )
      .include("decidedBy", (user) =>
        user.select("firstName", "lastName"),
      )
      .limit(20)
      .all(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
          Administration · Sécurité
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Validation des accès
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Chaque session, y compris celles des comptes existants, doit être
          explicitement approuvée par un SUPER_ADMIN avant d’accéder à l’ERP.
          Le compte SUPER_ADMIN qui valide les demandes est exempté.
        </p>
      </header>

      {message && (
        <p
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${message.tone}`}
        >
          {message.text}
        </p>
      )}

      <section aria-labelledby="pending-heading" className="space-y-4">
        <div>
          <h2 id="pending-heading" className="text-xl font-semibold text-slate-900">
            Demandes en attente
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {pendingRequests.length} demande(s) à traiter (maximum 100 affichées).
          </p>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Aucune demande d’accès en attente.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const requester = request.user;
              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {requester
                          ? `${requester.firstName} ${requester.lastName}`
                          : "Compte introuvable"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {requester?.email ?? "—"} · {requester?.role ?? "Rôle inconnu"}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Demande du {formatDate(request.requestedAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <form action={approveAccountAccess}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                        >
                          Approuver
                        </button>
                      </form>
                      <form action={rejectAccountAccess}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          Refuser
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="history-heading" className="space-y-4">
        <div>
          <h2 id="history-heading" className="text-xl font-semibold text-slate-900">
            Décisions récentes
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Les 20 dernières décisions restent consultables pour audit.
          </p>
        </div>

        {recentDecisions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Aucune décision enregistrée.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Compte</th>
                  <th className="px-4 py-3 font-semibold">Décision</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Validateur</th>
                </tr>
              </thead>
              <tbody>
                {recentDecisions.map((request) => {
                  const requester = request.user;
                  const approver = request.decidedBy;
                  const approved = String(request.status) === "APPROVED";
                  return (
                    <tr key={request.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900">
                          {requester
                            ? `${requester.firstName} ${requester.lastName}`
                            : "Compte introuvable"}
                        </span>
                        <span className="block text-slate-500">
                          {requester?.email ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            approved
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {approved ? "Approuvée" : "Refusée"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {request.decidedAt
                          ? formatDate(request.decidedAt)
                          : "Date indisponible"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {approver
                          ? `${approver.firstName} ${approver.lastName}`
                          : "Compte introuvable"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
