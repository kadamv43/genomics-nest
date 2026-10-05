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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GalleryService } from './gallery.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly blogService: GalleryService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateGalleryDto,
  ) {
    return this.blogService.update(id, updateDoctorDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
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
