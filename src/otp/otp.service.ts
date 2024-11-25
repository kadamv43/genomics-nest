import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { firstValueFrom } from 'rxjs';
import { Otp, OtpDocument } from './otp.schema';
import { Model } from 'mongoose';
import { OtpDto } from './otp.dto';
import { env } from 'process';
import { VerifyOtpDto } from './verify-otp.dto';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModal: Model<OtpDocument>,
    private httpService: HttpService,
  ) {}

  async sendOtp(otpData: OtpDto) {
    const { mobile } = otpData;

    const otp = this.generateOtp();

    let data = {
      integrated_number: process.env.WHATSAPP_NUMBER,
      content_type: 'template',
      payload: {
        messaging_product: 'whatsapp',
        type: 'template',
        template: {
          name: 'otp',
          language: {
            code: 'en_GB',
            policy: 'deterministic',
          },
          namespace: null,
          to_and_components: [
            {
              to: [mobile],
              components: {
                body_1: {
                  type: 'text',
                  value: otp,
                },
                button_1: {
                  subtype: 'url',
                  type: 'text',
                  value: otp,
                },
              },
            },
          ],
        },
      },
    };

    const url = process.env.WHATSAPP_API;

    try {
      const headers = {
        authkey: process.env.WHATSAPP_API_KEY, // Add your authorization token if needed
        'Content-Type': 'application/json', // Content type for JSON
      };

      if (process.env.OTP == 'true') {
        const response = await firstValueFrom(
          this.httpService.post(url, data, { headers }), // data is the request body
        );
      }

      const mobilexist = await this.otpModal.findOne({ mobile }).exec();

      if (mobilexist) {
        mobilexist.otp = otp;
        mobilexist.save();
      } else {
        const createdOTP = new this.otpModal({ mobile, otp });
        await createdOTP.save();
      }

      return { message: 'OTP sent Successfully', data: [] };

      // return response.data; // Return the data from the API response
    } catch (error) {
      // Handle errors here
      console.error('Error making POST request', error);
      throw error;
    }
  }

  generateOtp(): string {
    const otp = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
    return otp.toString();
  }

  async verifyOTP(otpData: VerifyOtpDto) {
    return await this.otpModal.findOne(otpData).exec();
  }
}
