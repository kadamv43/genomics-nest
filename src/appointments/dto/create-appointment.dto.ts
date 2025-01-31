import { Doctor } from 'src/doctors/doctor.schema';
import { Invoice } from 'src/invoice/invoice.schema';
import { Patient } from 'src/patients/patients.schema';
import { Product } from 'src/products/product.schema';

// src/patients/dto/create-patient.dto.ts
export class CreateAppointmentDto {
  appointment_number: string;
  patient?: string;
  doctor?: string;
  appointment_date?: string;
  appointment_time?: string;
  services?: Product[];
  reason?: string;
  remark?: string;
  invoice?: Invoice;
  follow_up?: string;
  doctor_note?: string;
}
