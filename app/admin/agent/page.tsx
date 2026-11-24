import { getRegisteredAgents } from "@/lib/erp-data";
import { requirePermission } from "@/lib/erp-auth";
import { AgentTabs } from "@/components/erp/agent-tabs";
import { getAgentTrainings } from "./actions";
import { TrainingForm } from "./training-form";

export const dynamic = "force-dynamic";

export default async function AgentPage({
  searchParams,
}: PageProps<"/admin/agent">) {
  await requirePermission("employees:read");
  const [{ status, error }, agents, trainings] = await Promise.all([
    searchParams,
    getRegisteredAgents(),
    getAgentTrainings(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">AGENT</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Formation des agents</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Enregistrez chaque journée de formation, son contenu et le formateur.
        </p>
      </header>

      <AgentTabs active="formation" />

      {status === "formation-created" && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          La journée de formation a été enregistrée.
        </p>
      )}
      {error === "formation-invalid" && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Vérifiez les informations saisies pour la formation.
        </p>
      )}
      {error === "agent-missing" && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          L&apos;agent sélectionné est introuvable.
        </p>
      )}

      <TrainingForm agents={agents.map((agent) => ({
        id: String(agent.id),
        name: `${agent.lastName} ${agent.postName ?? ""} ${agent.firstName}`.replace(/\s+/g, " ").trim(),
      }))} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Jours de formation enregistrés</h2>
            <p className="mt-1 text-sm text-slate-500">Chaque ligne correspond à une journée de formation.</p>
          </div>
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            Nombre total de jours : {trainings.length}
          </p>
        </div>

        {trainings.length === 0 ? (
          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Aucune formation enregistrée.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">DATE</th>
                  <th className="px-4 py-3 font-semibold">AGENT</th>
                  <th className="px-4 py-3 font-semibold">CONTENU DE LA FORMATION</th>
                  <th className="px-4 py-3 font-semibold">FORMATEUR</th>
                </tr>
              </thead>
              <tbody>
                {trainings.map((training) => (
                  <tr key={String(training.id)} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-600">{String(training.trainingDate)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{training.agentName}</td>
                    <td className="px-4 py-3 text-slate-600">{training.subject}</td>
                    <td className="px-4 py-3 text-slate-600">{training.trainer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
