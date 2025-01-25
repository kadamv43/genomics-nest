import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from './patients.schema';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from 'src/email/email.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname } from 'path';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
    HttpModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = process.env.UPLOAD_PATH + 'patient/';

          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Create parent directories if needed
          }

          console.log(uploadPath);
          cb(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const fileExt = extname(file.originalname);
          const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
          callback(null, fileName);
        },
      }),
    }),
  ],
  providers: [PatientsService, EmailService],
  controllers: [PatientsController],
  exports: [MongooseModule, PatientsService],
})
export class PatientsModule {}
