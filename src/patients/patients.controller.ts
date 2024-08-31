// src/patients/patients.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Patient } from './patients.schema';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';


@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  async create(@Body() createPatientDto: CreatePatientDto): Promise<Patient> {
    let patient_number =
      await this.patientsService.generateUniquePatientNumber();
    createPatientDto.patient_number = patient_number;
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    return this.patientsService.findAll(query);
  }

  @Get('search')
  async findBy(@Query() query: Record<string, any>): Promise<Patient[]> {
    return this.patientsService.findBy(query);
  }

  @Get('global-search')
  async globalSearch(@Query('q') query: string): Promise<Patient[]> {
    return this.patientsService.globalSearch(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Patient> {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Patch(':id')
  updatePartial(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Patient> {
    return this.patientsService.remove(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    await this.patientsService.importData(jsonData);

    return { message: 'File uploaded and data saved successfully!' };
  }
}
