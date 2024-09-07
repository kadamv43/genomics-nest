import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { CreateContactDetailDto } from './dto/create-contact-details.dto';
import { ContactDetailsService } from './contact-details.service';
import { ContactDetail } from './contact-detail.schema';
import { UpdateContactDetailDto } from './dto/update-contact-details.dto';

@Controller('contact-details')
export class ContactDetailsController {
  constructor(private readonly contactDetailsService: ContactDetailsService) {}

  @Post()
  async create(@Body() createDoctorDto: CreateContactDetailDto) {
    return this.contactDetailsService.create(createDoctorDto).catch((err) => {
      console.log(err);
    });
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    return this.contactDetailsService.findAll();
  }

  @Get('search')
  async findBy(@Query() query: Record<string, any>): Promise<ContactDetail[]> {
    return this.contactDetailsService.findBy(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contactDetailsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateContactDetailDto,
  ) {
    return this.contactDetailsService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contactDetailsService.remove(id);
  }

  @Patch(':id')
  updatePartial(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateContactDetailDto,
  ) {
    return this.contactDetailsService.update(id, updateDoctorDto);
  }
}
