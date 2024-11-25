// src/patients/dto/create-patient.dto.ts
export class SignUpDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly huband_name: string;
  readonly dob: Date;
  readonly husband_dob: Date;
  readonly email: string;
  readonly mobile: string;
  readonly husband_mobile: string;
  readonly address?: string;
  readonly medicalHistory?: string;
  readonly reference_by?: string;
  patient_number?: string;
}
