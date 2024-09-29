// src/patients/dto/create-patient.dto.ts
export class CreatePatientDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly dob: Date;
  readonly email: string;
  readonly mobile: string;
  readonly address?: string;
  readonly medicalHistory?: string;
  patient_number?: string;
}