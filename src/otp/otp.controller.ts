import { BadRequestException, Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpDto } from './otp.dto';
import { VerifyOtpDto } from './verify-otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post('send-otp')
  async sendOTP(@Body(new ValidationPipe()) otp: OtpDto) {
    return await this.otpService.sendOtp(otp);
  }
 
  @Post('verify-otp')
  async verifyOTP(@Body() otp: VerifyOtpDto) {
    const otpVerified = await this.otpService.verifyOTP(otp);
    if (otpVerified) {
      return { message: 'OTP verified successfully', data: [] };
    } else {
      throw new BadRequestException('Invalid OTP');
    }
  }
}