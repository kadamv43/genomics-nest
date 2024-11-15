import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { CreateAppointmentWebDto } from 'src/appointments/dto/create-appointment-web.dto';
import { PatientsService } from 'src/patients/patients.service';
import * as https from 'https';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('web')
export class WebController {
  constructor(
    private patientService: PatientsService,
    private appointmentService: AppointmentsService,
    private readonly httpService: HttpService,
  ) {}

  @Post('appointment')
  async createAppointment(@Body() body) {
    const patient = await this.patientService.create(body);

    let appointment_number =
      await this.appointmentService.generateUniqueAppointmentNumber();

    let createAppointmentDto: CreateAppointmentWebDto = {
      appointment_number: appointment_number,
      patient,
      reason: body.message,
      remark: '',
      status: 'created',
      appointment_time: new Date().toISOString(),
      appointment_date: new Date().toISOString(),
    };

    return this.appointmentService.createFromWeb(createAppointmentDto);
  }

  @Post('get-appointment-by-mobile')
  async findAll(@Body() body) {
    const patient: any = await this.patientService.findBy({
      mobile: body.mobile,
    });
    if (patient.length == 0) {
      return { message: 'No Patient exist for this Mobile Number', data: [] };
    }
    const appointments = await this.appointmentService.findByPatienId(
      patient[0]?._id,
    );
    if (appointments.length == 0) {
      return {
        message: 'No Appointments exist for this Mobile Number',
        data: [],
      };
    }

    let otp = this.generateOtp();
    let mobile = patient[0]?.mobile;

    this.sendOtp(otp, mobile);

    await this.patientService.update(patient[0]?._id, { otp: otp });

    return {
      message: 'OTP sent successfully on your whatsapp',
      data: [],
    };
  }

  @Post('login')
  async login(@Body() body) {
    const patient: any = await this.patientService.findBy({
      mobile: body.mobile,
    });

    if (patient.length == 0) {
      throw new NotFoundException('Mobile number does not exist');
    }

    let otp = this.generateOtp();
    let mobile = patient[0]?.mobile;

    this.sendOtp(otp, mobile);

    await this.patientService.update(patient[0]?._id, { otp: otp });

    return {
      message: 'OTP sent successfully on your whatsapp',
      data: [],
    };
  }

  @Post('verify-otp-for-reports')
  async verifyOtpForReports(@Body() body) {
    const patient: any = await this.patientService.findBy({
      mobile: body.mobile,
    });
    if (patient.length == 0) {
      return { message: 'No Patient exist for this Mobile Number', data: [] };
    }

    if (patient[0]?.otp == body.otp) {
      const appointments = await this.appointmentService.findByPatienId(
        patient[0]?._id,
      );
      if (appointments.length == 0) {
        return {
          message: 'No Appointments exist for this Mobile Number',
          data: [],
        };
      }

      return { message: 'OTP verifed successfully', data: appointments };
    } else {
      return { message: 'OTP invalid', data: [] };
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body) {
    const patient: any = await this.patientService.findBy({
      mobile: body.mobile,
    });
    if (patient.length == 0) {
      throw new NotFoundException('Mobile number does not exist');
    }

    if (patient[0]?.otp == body.otp) {

      return { message: 'OTP verifed successfully', data: [] };
    } else {
      throw new NotFoundException('OTP invalid');
    }
  }

  generateOtp(): string {
    const otp = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
    return otp.toString();
  }

  async sendOtp(otp, mobile) {
    let data = {
      integrated_number: '919324699801',
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

    const url =
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';

    try {
      const headers = {
        authkey: '430399Ae1EHHrD66e68c80P1', // Add your authorization token if needed
        'Content-Type': 'application/json', // Content type for JSON
      };

      // Make the POST request using Axios (via HttpService)
      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers }), // data is the request body
      );

      return response.data; // Return the data from the API response
    } catch (error) {
      // Handle errors here
      console.error('Error making POST request', error);
      throw error;
    }
  }
}
