import {
  getAgentApplications,
  getAgentIdentityFiles,
  getRegisteredAgents,
} from "@/lib/erp-data";
import { unstable_noStore as noStore } from "next/cache";
import { hasPermission, requirePermission } from "@/lib/erp-auth";
import { AgentTabs } from "@/components/erp/agent-tabs";
import { changeAgentStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function EmployeesPage({
  searchParams,
}: PageProps<"/admin/employees">) {
  const user = await requirePermission("employees:read");
  noStore();
  const [{ status, tab, q }, applications, identities, registeredAgents] = await Promise.all([
    searchParams,
    getAgentApplications(),
    getAgentIdentityFiles(),
    getRegisteredAgents(),
  ]);
  const activeTab = tab === "all" || tab === "search" || tab === "inactive" ? tab : "active";
  const query = typeof q === "string" ? q.trim() : "";
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
  const identityApplicationIds = new Set(
    identities.map((identity) => String(identity.agentApplicationId)),
  );
  const agents = [
    ...registeredAgents.map((agent) => ({
      id: String(agent.id),
      firstName: agent.firstName,
      postName: agent.postName ?? "",
      lastName: agent.lastName,
      birthDate: agent.birthDate ? String(agent.birthDate) : "—",
      birthPlace: agent.birthPlace ?? "—",
      nationality: "—",
      phone: agent.phone ?? "—",
      educationLevel: agent.educationLevel ?? "—",
      status: String(agent.status),
      hasIdentity: true,
      source: "account" as const,
    })),
    ...applications.map((agent) => ({
      id: String(agent.id),
      firstName: agent.firstName,
      postName: agent.postName,
      lastName: agent.lastName,
      birthDate: String(agent.birthDate),
      birthPlace: agent.birthPlace,
      nationality: agent.nationality,
      phone: agent.phone,
      educationLevel: agent.educationLevel,
      status: String(agent.status),
      hasIdentity: identityApplicationIds.has(String(agent.id)),
      source: "application" as const,
    })),
  ].sort((a, b) => a.lastName.localeCompare(b.lastName, "fr"));
  const visibleAgents = agents.filter((agent) => {
    const isActive = String(agent.status) === "ACTIVE";
    if (activeTab === "active" && !isActive) return false;
    if (activeTab === "inactive" && isActive) return false;
    if (activeTab === "search" && query) {
      const searchValue = normalize(query);
      return [
        agent.firstName,
        agent.postName,
        agent.lastName,
        agent.birthPlace,
        agent.nationality,
        agent.phone,
        agent.educationLevel,
      ].some((value) => normalize(value).includes(searchValue));
    }
    return true;
  });
  const statusMessages: Record<string, string> = {
    "application-created": "Le dossier de candidature de l’agent a été enregistré.",
    "identity-created": "Le dossier d’identité de l’agent a été enregistré.",
    archived: "L’agent a été archivé et apparaît dans la liste des agents non-actifs.",
    restored: "L’agent a été réactivé.",
  };
  const statusMessage =
    typeof status === "string" ? statusMessages[status] : undefined;

  return (
    <div className="space-y-6">
      <header>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">AGENT</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Gestion des agents</h1>
        </div>
      </header>

      <AgentTabs active={activeTab} />

      {statusMessage && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {statusMessage}
        </p>
      )}

      {activeTab === "search" && (
        <form action="/admin/employees" method="get" className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
          <input type="hidden" name="tab" value="search" />
          <label htmlFor="agent-search" className="sr-only">Rechercher un agent</label>
          <input
            id="agent-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Nom, lieu de naissance, nationalité, téléphone ou études"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm"
          />
          <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
            Rechercher
          </button>
        </form>
      )}

      {activeTab === "search" && !query ? (
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Saisissez un critère pour rechercher rapidement un agent.
        </p>
      ) : visibleAgents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Aucun agent trouvé</h2>
          <p className="mt-2 text-sm text-slate-600">
            {activeTab === "inactive" ? "Aucun agent n’est actuellement archivé." : "Les agents correspondant à cette liste apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">NOM COMPLET</th>
                <th className="px-4 py-3 font-semibold">DATE / LIEU DE NAISSANCE</th>
                <th className="px-4 py-3 font-semibold">TÉLÉPHONE</th>
                <th className="px-4 py-3 font-semibold">NIVEAU D’ÉTUDES</th>
                <th className="px-4 py-3 font-semibold">DOSSIER D’IDENTITÉ</th>
                <th className="px-4 py-3 font-semibold">STATUT</th>
                <th className="px-4 py-3 font-semibold">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {visibleAgents.map((agent) => {
                const isActive = String(agent.status) === "ACTIVE";
                return (
                  <tr key={String(agent.id)} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {agent.lastName} {agent.postName} {agent.firstName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {String(agent.birthDate)} — {agent.birthPlace}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{agent.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{agent.educationLevel}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {agent.hasIdentity ? "Complété" : "À compléter"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {isActive ? "ACTIF" : "NON-ACTIF"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isActive && hasPermission(user, "employees:archive") ? (
                        <form action={changeAgentStatus.bind(null, agent.source, agent.id, "ARCHIVED")}>
                          <button type="submit" className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-50">
                            Archiver
                          </button>
                        </form>
                      ) : !isActive && hasPermission(user, "employees:restore") ? (
                        <form action={changeAgentStatus.bind(null, agent.source, agent.id, "ACTIVE")}>
                          <button type="submit" className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50">
                            Réactiver
                          </button>
                        </form>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
