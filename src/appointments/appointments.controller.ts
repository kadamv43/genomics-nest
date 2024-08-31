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
import { PdfService } from 'src/services/pdf/pdf.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { DoctorsService } from 'src/doctors/doctors.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/services/file-upload/file-upload/file-upload.service';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private doctorService: DoctorsService,
    private pdfService: PdfService,
    private fileUploadSevice: FileUploadService,
  ) {}

  @Post()
  async create(@Body() createAppointmentDto: Appointment) {
    createAppointmentDto.appointment_number =
      await this.appointmentsService.generateUniqueAppointmentNumber();
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: Record<string, any>) {
    if (req.user['role'] == 'admin' || req.user['role'] == 'staff') {
      return this.appointmentsService.findAll(query);
    } else {

      let doctor: any = await this.doctorService.findBy({
        user_id: req.user['userId'],
      });

      query.doctor = doctor._id
      return await this.appointmentsService.findAll(query);
    }
  }


  @Post('upload-files/:id')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @Param('id') id: string,
    @Body() body,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    let file_name = body.file_name
    const filePaths = await this.fileUploadSevice.uploadFiles(files);
    filePaths.forEach((item) => {
      this.appointmentsService.addFilesToAppointment(id, item,file_name);
    });

    return {
      message: 'Files uploaded successfully',
      filePaths,
    };
  }

  @Post('invoice-pdf/:id')
  async generatePdf(
    @Param('id') id: string,
    @Body() Body,
    @Res() res: Response,
  ) {
    // const data = await this.appointmentsService.findOne(id)
    const data = Body;

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
      res.status(500).send(error);
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
