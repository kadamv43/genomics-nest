import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './appointment.schema';
import { PdfService } from 'src/services/pdf/pdf.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { DoctorsService } from 'src/doctors/doctors.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private doctorService: DoctorsService,
    private pdfService: PdfService,
  ) {}

  @Post()
  async create(@Body() createAppointmentDto: Appointment) {
    createAppointmentDto.appointment_number =
      await this.appointmentsService.generateUniqueAppointmentNumber();
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: Request) {
    console.log(req.user);
    if (req.user['role'] == 'admin' || req.user['role'] == 'staff') {
      return this.appointmentsService.findAll();
    } else {
      let doctor: any = await this.doctorService.findBy({
        user_id: req.user['userId'],
      });
      return this.appointmentsService.findBy({ doctor: doctor.doctor_id });
      //return this.appoin--=[[({ doctor: req.user['userId'] });
    }
  }

  @Get('search')
  async findBy(@Query() query: Record<string, any>): Promise<Appointment[]> {
    return this.appointmentsService.findBy(query);
  }

  @Post('invoice-pdf/:id')
  async generatePdf(@Param('id') id: string, @Body() Body, @Res() res: Response) {
    // const data = await this.appointmentsService.findOne(id)

    const data = {
      _id: '66af48ef8b17f521dda20bef',
      appointment_number: 'GENOMICS-00000031',
      patient_id: '66af48ef8b17f521dda20bec',
      appointment_date: '2024-08-04T09:23:59.784Z',
      appointment_time: '2024-08-04T09:23:59.784Z',
      services: [
        {
          _id: '66ada66c06e360ca18d0ef32',
          name: 'Endoscopy',
          price: '9000',
          created_at: '2024-08-03T03:39:24.939Z',
          updated_at: '2024-08-03T03:39:24.939Z',
          __v: 0,
        },
        {
          _id: '66adb1c5d082ba5950bb9540',
          name: 'Surrogacy',
          price: '5000',
          created_at: '2024-08-03T04:27:49.805Z',
          updated_at: '2024-08-03T04:27:49.805Z',
          __v: 0,
        },
      ],
      reason: 'test',
      status: 'created',
      created_at: '2024-08-04T09:25:03.407Z',
      updated_at: '2024-08-04T09:25:03.407Z',
      __v: 0,
      patient: {
        _id: '66af48ef8b17f521dda20bec',
        first_name: 'vinayak',
        last_name: 'kadam',
        dob: '1993-07-13T18:30:00.000Z',
        age: '31',
        gender: 'Male',
        blood_group: 'A+',
        mobile: '8286538006',
        email: 'kadamv43@gmail.com',
        created_at: '2024-08-04T09:25:03.394Z',
        updated_at: '2024-08-04T09:25:03.394Z',
        __v: 0,
      },
      doctor: null,
    };
    console.log(data);
    try {
      const pdfBuffer = await this.pdfService.generatePdf(data);
      res.set({
        // pdf
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=pdf.pdf`,
        'Content-Length': pdfBuffer.length,
        // prevent cache
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0,
      });
      res.end(pdfBuffer);
    } catch (error) {
      console.log(error);
      res.status(500).send('Could not generate PDF');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppointmentDto: Appointment) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
