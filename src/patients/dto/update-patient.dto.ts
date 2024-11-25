// src/patients/dto/create-patient.dto.ts
export class UpdatePatientDto {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly huband_name?: string;
  readonly dob?: Date;
  readonly husband_dob?: Date;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: string;
  readonly medicalHistory?: string;
  patient_number?: string;
  otp?: string;
}
