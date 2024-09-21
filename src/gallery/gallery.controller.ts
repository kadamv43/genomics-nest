// blog.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  Query,
  Patch,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly blogService: GalleryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createBlog(@Body() body, @UploadedFile() file: Express.Multer.File) {
    let file_name = body.file_name;
    return this.blogService.createBlog(body);
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    return this.blogService.findAll(query);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return this.blogService.getBlogById(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateGalleryDto,
  ) {
    return this.blogService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  updatePartial(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateGalleryDto,
  ) {
    console.log(updateDoctorDto);
    return this.blogService.update(id, updateDoctorDto);
  }
}
