import { Module } from '@nestjs/common';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { Banner, BannerSchema } from './banner.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  providers: [BannersService],
  imports: [
    MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),
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
  controllers: [BannersController],
})
export class BannersModule {}
