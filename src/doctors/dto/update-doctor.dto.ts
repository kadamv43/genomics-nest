import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  Min,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class UpdateDoctorDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsOptional()
  specialization: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };

  @IsNumber()
  @Min(0)
  @IsOptional()
  years_of_experience?: number;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}
