import { Patient } from "src/patients/patients.schema";

// src/patients/dto/create-patient.dto.ts
export class CreateAppointmentWebDto {
  appointment_number: string;
  patient: Patient;
  files?: [{}];
  services?: [];
  reason: string;
  remark: string;
  status: string;
  appointment_time: string;
  appointment_date:string
}
