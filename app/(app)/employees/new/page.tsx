import { createEmployee } from "../actions";
import { canAssignRole, ERP_ROLES, requirePermission } from "@/lib/erp-auth";

const errorMessages: Record<string, string> = {
  invalid: "Vérifiez les informations saisies et le rôle sélectionné.",
  "role-not-assignable": "Votre niveau d’accès ne vous permet pas d’attribuer ce profil.",
  "profile-exists": "Un profil EXLS existe déjà pour cette adresse e-mail.",
  invite: "L’invitation n’a pas pu être envoyée. Vérifiez la configuration Supabase Auth.",
  profile: "Le profil EXLS n’a pas pu être enregistré. Vérifiez le matricule et réessayez.",
};

export default async function NewEmployeePage({
  searchParams,
}: PageProps<"/employees/new">) {
  const user = await requirePermission("employees:create");
  const { error } = await searchParams;
  const errorMessage =
    typeof error === "string" ? errorMessages[error] : undefined;
  const assignableRoles = ERP_ROLES.filter(
    (role) => role !== "ADMIN" && canAssignRole(user, role),
  );

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Personnel</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Nouvel employé</h1>
        <p className="mt-2 text-sm text-slate-600">
          Un profil EXLS est créé et un lien de connexion est envoyé à l’adresse indiquée.
        </p>
      </header>

      <form action={createEmployee} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {errorMessage && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage}
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            <span>Prénom</span>
            <input name="firstName" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Nom</span>
            <input name="lastName" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            <span>Matricule</span>
            <input name="matricule" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Email</span>
            <input name="email" type="email" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
          </label>
        </div>
        <label className="block space-y-2 text-sm text-slate-600">
          <span>Profil</span>
          <select name="role" required defaultValue="AGENT" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
            {assignableRoles.map((role) => (
              <option key={role} value={role}>
                {{
                  AGENT: "Agent",
                  SUPERVISOR: "Superviseur",
                  MANAGER: "Responsable",
                  DIRECTOR: "Direction",
                  ADMIN: "Administrateur",
                }[role]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span>Téléphone</span>
          <input name="phone" className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <a href="/employees" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Annuler</a>
          <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Créer le profil et inviter</button>
        </div>
      </form>
    </div>
  );
}
