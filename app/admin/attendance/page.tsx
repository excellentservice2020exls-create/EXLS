import { createAttendanceRecord, verifyAttendance } from "./actions";
import { getAccessibleShifts, getAgentById, getAttendanceForShift, getSiteById } from "@/lib/erp-data";
import { unstable_noStore as noStore } from "next/cache";
import { hasPermission, requirePermission } from "@/lib/erp-auth";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams?: Promise<{ shiftId?: string; date?: string; error?: string }>;
}) {
  const user = await requirePermission("attendance:read");
  const params = await searchParams;
  noStore();
  const requestedDate = params?.date ?? "";
  const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
    ? requestedDate
    : dateValue(new Date());
  const shifts = await getAccessibleShifts(user, targetDate);
  const selectedShift = params?.shiftId
    ? shifts.find((shift) => String(shift.id) === params.shiftId) ?? null
    : shifts[0] ?? null;

  if (!selectedShift) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Aucune mission pour cette date</h1>
      </div>
    );
  }

  const site = await getSiteById(selectedShift.siteId);
  const agent = await getAgentById(selectedShift.agentId);
  const attendance = await getAttendanceForShift(selectedShift.id);
  const record = attendance[0];
  const canVerify = hasPermission(user, "attendance:verify");
  const canCreateForShift =
    hasPermission(user, "attendance:create:team") ||
    (hasPermission(user, "attendance:create:self") && selectedShift.agentId === user.id);
  const errors: Record<string, string> = {
    invalid: "Les informations de pointage sont invalides.",
    shift_not_found: "Cette mission n’existe plus.",
    shift_closed: "Le pointage est fermé pour cette mission.",
    invalid_time: "La date ou l’heure ne correspond pas au créneau de la mission.",
    already_recorded: "Un pointage existe déjà pour cette mission.",
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Présences</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Pointage par mission</h1>
      </header>

      {params?.error && errors[params.error] && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors[params.error]}
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Mission sélectionnée</p>
            <p className="text-lg font-semibold text-slate-900">{selectedShift.title} • {site?.name ?? "Site"}</p>
          </div>
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            Prévu : {new Date(selectedShift.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">{agent ? `${agent.firstName} ${agent.lastName}` : "Agent non assigné"}</p>
            <p className="text-sm text-slate-500">{agent ? String(agent.role) : "Rôle inconnu"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {record ? (
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                {String(record.status) === "VERIFIED" ? "Pointage validé" : "Première arrivée"}
                {record.lateMinutes > 0 && ` · Retard ${record.lateMinutes} min`}
                {` : ${new Date(record.clockInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Aucune arrivée</span>
            )}
          </div>
        </div>

        {!record && canCreateForShift && (
          <form action={createAttendanceRecord} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <input type="hidden" name="shiftId" value={selectedShift.id} />
            <label className="space-y-2 text-sm text-slate-600">
              <span>Date d&apos;arrivée</span>
              <input type="date" name="date" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={dateValue(selectedShift.startTime)} />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>Heure d&apos;arrivée</span>
              <input type="time" name="time" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="07:00" />
            </label>
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
              Enregistrer
            </button>
          </form>
        )}

        {record && canVerify && String(record.status) !== "VERIFIED" && (
          <form action={verifyAttendance} className="mt-4">
            <input type="hidden" name="attendanceId" value={record.id} />
            <button type="submit" className="rounded-xl border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">
              Valider le pointage
            </button>
          </form>
        )}

        {attendance.length > 0 && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-medium text-slate-700">Historique</p>
            <ul className="mt-2 space-y-1">
              {attendance.map((record) => (
                <li key={record.id}>{new Date(record.clockInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {String(record.status)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function dateValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
