import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Doctor } from './doctor.schema';

@UseGuards(JwtAuthGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorService: DoctorsService) {}

  @Post()
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto).catch((err) => {
      console.log(err);
    });
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    return this.doctorService.findAll(query);
  }

  @Get('search')
  async findBy(@Query() query: Record<string, any>): Promise<Doctor[]> {
    return this.doctorService.findBy(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }

  @Patch(':id')
  updatePartial(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorService.update(id, updateDoctorDto);
  }
}
