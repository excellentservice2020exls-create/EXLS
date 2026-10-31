import Link from "next/link";
import { getEmployees } from "@/lib/erp-data";
import { unstable_noStore as noStore } from "next/cache";
import { MANAGEMENT_ROLES, requireRole } from "@/lib/erp-auth";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  await requireRole(MANAGEMENT_ROLES);
  noStore();
  const employees = await getEmployees();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Personnel</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Gestion du personnel</h1>
        </div>
        <Link href="/employees/new" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
          + Ajouter un employé
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Matricule</th>
              <th className="px-4 py-3 font-semibold">Rôle</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">{employee.firstName} {employee.lastName}</td>
                <td className="px-4 py-3 text-slate-600">{employee.matricule}</td>
                <td className="px-4 py-3 text-slate-600">{String(employee.role)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${String(employee.status) === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {String(employee.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{employee.phone ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
