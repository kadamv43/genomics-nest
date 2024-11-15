import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { GalleryImagesService } from './gallery-images.service';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('gallery-images')
export class GalleryImagesController {
  constructor(private readonly galleryImageService: GalleryImagesService) {}

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    return this.galleryImageService.findAll(query);
  }

  @Post(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async createGalleryImages(
    @Param('id') id: string,
    @Body() body,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log('id', id);
    let data: any = [];
    files.forEach((item) => {
      data.push({ gallery:id, image: 'gallery/' + item.filename });
    });
    return this.galleryImageService.createBlog(data);
  }

  @Get(':id')
  async getImagesById(@Param('id') id: string) {
    return this.galleryImageService.getImagesByGalleryId(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.galleryImageService.remove(id);
  }
}
