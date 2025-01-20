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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './appointment.schema';
import { CreateAppointmentWebDto } from './dto/create-appointment-web.dto';
import { PdfService } from 'src/services/pdf/pdf.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { DoctorsService } from 'src/doctors/doctors.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/services/file-upload/file-upload/file-upload.service';
import { get } from 'http';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { EmailService } from 'src/email/email.service';
import { format, formatDate } from 'date-fns';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private doctorService: DoctorsService,
    private emailService: EmailService,
  ) {}

  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    createAppointmentDto.appointment_number =
      await this.appointmentsService.generateUniqueAppointmentNumber();
    const appointment: any =
      await this.appointmentsService.create(createAppointmentDto);
    if (appointment) {
      let data = await this.appointmentsService.findOne(appointment?._id);
      console.log(data);
      let subject = `New Appointment (${data.appointment_number})`;
      let newData = this.modifyAppointmentData(data);
      this.emailService
        .sendMailTemplateToAdmin(subject, newData, './create_appointment')
        .catch((e) => {
          console.error(e);
        });
    }

    return appointment;
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: Record<string, any>) {
    if (req.user['role'] == 'admin' || req.user['role'] == 'staff') {
      return this.appointmentsService.findAll(query);
    } else {
      // console.log(req)
      let doctor: any = await this.doctorService.findBy({
        user_id: req.user['userId'],
      });

      // console.log(doctor);
      query.doctor = doctor[0]._id;
      return await this.appointmentsService.findAll(query);
    }
  }

  @Get('search')
  async getAppointmentBy(
    @Req() req: Request,
    @Query() query: Record<string, any>,
  ) {
    return await this.appointmentsService.findAll(query);
  }

  @Get('patient/:id')
  getAppointmentsByPatienId(@Param('id') id: string) {
    return this.appointmentsService.findByPatienId(id);
  }

  @Post('upload-files/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFiles(
    @Param('id') id: string,
    @Body() body,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.appointmentsService.addFilesToAppointment(
      id,
      'appointment/' + file.filename,
      body.report_name,
    );

    return {
      message: 'Files uploaded successfully',
      //  filePaths,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    console.log('updateDOc', updateAppointmentDto);
    if (updateAppointmentDto.follow_up) {
      let appointment_number =
        await this.appointmentsService.generateUniqueAppointmentNumber();
      let appointment: CreateAppointmentDto = {
        appointment_number,
        patient: updateAppointmentDto.patient_id,
        doctor: updateAppointmentDto.doctor_id,
        appointment_date: updateAppointmentDto.follow_up,
        appointment_time: updateAppointmentDto.follow_up,
      };
      await this.appointmentsService.create(appointment);
    }

    const appointment: any = this.appointmentsService.update(
      id,
      updateAppointmentDto,
    );

    if (appointment) {
      let data = await this.appointmentsService.findOne(id);
      console.log(data);
      let subject = `Appointment Updated (${data.appointment_number})`;
      let newData = this.modifyAppointmentData(data);
      this.emailService
        .sendMailTemplateToAdmin(subject, newData, './edit_appointment')
        .catch((e) => {
          console.error(e);
        });
    }

    return appointment;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Patch('reports/:id')
  removeReport(@Param('id') id: string, @Body() body: any) {
    return this.appointmentsService.removeReport(id, body.image_id);
  }

  modifyAppointmentData(data) {
    let newData = {};
    newData['appointment'] = data?.appointment_number;
    newData['patient'] =
      data?.patient?.first_name + ' ' + data?.patient?.last_name;
    newData['doctor'] =
      data?.doctor?.first_name + ' ' + data?.doctor?.last_name;
    newData['appointment_date'] = formatDate(
      data?.appointment_date,
      'dd-MM-yyyy hh:mm a',
    );
    return newData;
  }
}
