import { Doctor } from 'src/doctors/doctor.schema';
import { Invoice } from 'src/invoice/invoice.schema';
import { Patient } from 'src/patients/patients.schema';
import { Product } from 'src/products/product.schema';

// src/patients/dto/create-patient.dto.ts
export class UpdateAppointmentDto {
  title?: string;
  desctiption?: string;
  status?: string;
  image?: string;
  appointment_number?: string;
  patient_id?: string;
  doctor_id?: string;
  patient?: Patient;
  doctor?: Doctor;
  appointment_date?: string;
  appointment_time?: string;
  services?: Product[];
  reason?: string;
  remark?: string;
  invoice?: Invoice;
  old_invoice?: Invoice;
  balance_invoice?: Invoice;
  follow_up?: string;
}
