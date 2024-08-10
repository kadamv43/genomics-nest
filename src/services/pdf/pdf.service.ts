import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { createPdf } from '@saemhco/nestjs-html-pdf';


@Injectable()
export class PdfService {
  async generatePdf(data: any): Promise<Buffer> {
    const filePath = path.join(process.cwd(), 'templates', 'invoice.hbs');
    return createPdf(filePath,{},data);
  }
}
