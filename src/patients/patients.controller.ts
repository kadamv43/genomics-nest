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
  BadRequestException,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Patient } from './patients.schema';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// @UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  prefix = 'PATIENT-';
  constructor(
    private readonly patientsService: PatientsService,
    private httpService: HttpService,
  ) {}

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

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    return await this.patientsService.insertData(jsonData);
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

  increamentPatientNumber(lastPatient) {
    let lastNumber = 0;

    if (lastPatient && lastPatient) {
      const lastNumberString = lastPatient?.replace(this.prefix, '');
      lastNumber = parseInt(lastNumberString, 10);
    }

    const nextNumber = lastNumber + 1;
    const paddedNumber = nextNumber.toString().padStart(7, '0'); // Adjust length as needed
    return `${this.prefix}${paddedNumber}`;
  }
}
