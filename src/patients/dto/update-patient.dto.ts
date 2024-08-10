// src/patients/dto/create-patient.dto.ts
export class UpdatePatientDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly dob: Date;
  readonly email: string;
  readonly phone: string;
  readonly address?: string;
  readonly medicalHistory?: string;
}
