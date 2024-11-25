import { IsNotEmpty, IsString } from 'class-validator';

// src/patients/dto/create-patient.dto.ts
export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  mobile: string;
  
  @IsString()
  otp: string;
}
