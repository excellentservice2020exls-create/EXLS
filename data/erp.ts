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
  { id: "", firstName: "", lastName: "", phone: "", status: "ACTIVE", site: "", role: "Superviseur" },
  { id: "", firstName: "", lastName: "", phone: "", status: "ACTIVE", site: "", role: "Agent" },
  { id: "", firstName: "", lastName: "", phone: "", status: "ACTIVE", site: "", role: "Agent" },
  { id: "", firstName: "", lastName: "", phone: "", status: "SUSPENDED", site: "", role: "Agent" },
];

export const clients: Client[] = [
  { id: "", name: "", contact: "", email: "", phone: "", city: "" },
  { id: "", name: "", contact: "", email: "", phone: "", city: "" },
  { id: "", name: "", contact: "", email: "", phone: "", city: "" },
];

export const missions: Mission[] = [
  { id: "", clientId: "", date: "", plannedStartAt: "", status: "", assignedEmployees: ["", ""] },
  { id: "", clientId: "", date: "", plannedStartAt: "", status: "", assignedEmployees: ["", ""] },
  { id: "", clientId: "", date: "", plannedStartAt: "", status: "", assignedEmployees: ["", ""] },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: "", missionId: "", employeeId: "", arrivedAt: "", createdBy: "" },
  { id: "", missionId: "", employeeId: "", arrivedAt: "", createdBy: "" },
  { id: "", missionId: "", employeeId: "", arrivedAt: "", createdBy: "" },
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
