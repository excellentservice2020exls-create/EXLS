"use client";

import { useFormStatus } from "react-dom";
import { createAgentTraining } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60">
      {pending ? "Enregistrement…" : "Enregistrer la journée"}
    </button>
  );
}

export function TrainingForm({ agents }: { agents: { id: string; name: string }[] }) {
  return (
    <form action={createAgentTraining} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Ajouter une journée de formation</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Agent
          <select name="agentId" required className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal">
            <option value="">Sélectionner un agent</option>
            {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Jour de formation
          <input name="trainingDate" type="date" required className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
        </label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          À quoi a consisté la formation ?
          <textarea name="subject" required rows={3} placeholder="Décrivez le contenu de la formation" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Formateur
          <input name="trainer" required placeholder="Nom du formateur" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
        </label>
      </div>
      <div className="mt-5"><SubmitButton /></div>
    </form>
  );
}
