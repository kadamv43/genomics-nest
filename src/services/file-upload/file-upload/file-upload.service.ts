import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class FileUploadService {
  async uploadFiles(files: Array<Express.Multer.File>): Promise<string[]> {
    const filePaths: string[] = [];

    files.forEach((file) => {
      
      const filePath = join(file.destination.replace('public/',''), file.filename);
      console.log(filePath);
      filePaths.push(filePath);
    });

    return filePaths;
  }
}
