export type EmployeeStatus = "ACTIVE" | "SUSPENDED" | "OFFBOARD";

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: EmployeeStatus;
  site: string;
  role: string;
};

export type Client = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
};

export type Mission = {
  id: string;
  clientId: string;
  date: string;
  plannedStartAt: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  assignedEmployees: string[];
};

export type AttendanceRecord = {
  id: string;
  missionId: string;
  employeeId: string;
  arrivedAt: string;
  createdBy: string;
};

export const employees: Employee[] = [
  { id: "emp-1", firstName: "Jean", lastName: "Kabila", phone: "+243 998 000 001", status: "ACTIVE", site: "Site Central", role: "Superviseur" },
  { id: "emp-2", firstName: "Sarah", lastName: "Mbuyi", phone: "+243 998 000 002", status: "ACTIVE", site: "Site Central", role: "Agent" },
  { id: "emp-3", firstName: "David", lastName: "Nsimba", phone: "+243 998 000 003", status: "ACTIVE", site: "Site Kivu", role: "Agent" },
  { id: "emp-4", firstName: "Grace", lastName: "Tshibanda", phone: "+243 998 000 004", status: "SUSPENDED", site: "Site Kivu", role: "Agent" },
];

export const clients: Client[] = [
  { id: "cli-1", name: "Bank of Kinshasa", contact: "Aline Mbuyu", email: "aline@bankkig.com", phone: "+243 000 111 001", city: "Kinshasa" },
  { id: "cli-2", name: "Parc Industriel Lufulu", contact: "Patrice Lukusa", email: "patrice@lufulu-industrie.com", phone: "+243 000 111 002", city: "Lubumbashi" },
  { id: "cli-3", name: "Centrale Médicale Sante+", contact: "Aurelie Kamba", email: "a.kamba@medicalplus.cd", phone: "+243 000 111 003", city: "Goma" },
];

export const missions: Mission[] = [
  { id: "mis-1", clientId: "cli-1", date: "2026-10-31", plannedStartAt: "2026-10-31T07:00:00", status: "IN_PROGRESS", assignedEmployees: ["emp-1", "emp-2", "emp-3"] },
  { id: "mis-2", clientId: "cli-2", date: "2026-10-31", plannedStartAt: "2026-10-31T18:00:00", status: "PLANNED", assignedEmployees: ["emp-2", "emp-3"] },
  { id: "mis-3", clientId: "cli-3", date: "2026-11-01", plannedStartAt: "2026-11-01T06:30:00", status: "PLANNED", assignedEmployees: ["emp-1", "emp-4"] },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: "att-1", missionId: "mis-1", employeeId: "emp-1", arrivedAt: "2026-10-31T07:12:00", createdBy: "Admin" },
  { id: "att-2", missionId: "mis-1", employeeId: "emp-2", arrivedAt: "2026-10-31T07:05:00", createdBy: "RH" },
  { id: "att-3", missionId: "mis-1", employeeId: "emp-3", arrivedAt: "2026-10-31T07:48:00", createdBy: "Superviseur" },
];

export function getEmployeeById(id: string) {
  return employees.find((employee) => employee.id === id);
}

export function getClientById(id: string) {
  return clients.find((client) => client.id === id);
}

export function getMissionById(id: string) {
  return missions.find((mission) => mission.id === id) ?? missions[0];
}

export function getAttendanceForMission(missionId: string) {
  return attendanceRecords.filter((record) => record.missionId === missionId);
}
