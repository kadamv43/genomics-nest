// src/patients/dto/create-patient.dto.ts
export class CreateAppointmentWebDto {
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly mobile: string;
  readonly message: string;
  appointment_number:string
}
