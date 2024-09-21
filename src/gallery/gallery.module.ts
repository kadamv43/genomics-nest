import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Gallery, GallerySchema } from './gallery.schema';
import { GalleryController } from './gallery.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  providers: [GalleryService],
  imports: [
    MongooseModule.forFeature([{ name: Gallery.name, schema: GallerySchema }]),
    MulterModule.register({
      storage: diskStorage({
        destination: process.env.UPLOAD_PATH,
        filename: (req, file, callback) => {
          const filename = `${file.originalname}`;
          callback(null, filename);
        },
      }),
    }),
  ],
  controllers: [GalleryController],
})
export class GalleryModule {}
