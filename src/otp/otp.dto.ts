import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

// src/patients/dto/create-patient.dto.ts
export class OtpDto {
  @IsString()
  @IsNotEmpty()
  mobile: string;
}
