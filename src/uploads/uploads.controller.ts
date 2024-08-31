import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('uploads')
export class UploadsController {

  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.env.UPLOAD_PATH, filename); // Change this to your path
    return res.sendFile(filePath);
  }
}

