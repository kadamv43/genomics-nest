import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blog.schema';
import { BlogController } from './blog.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  providers: [BlogService],
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
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
  controllers: [BlogController],
})
export class BlogModule {}
