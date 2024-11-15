
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { join } from 'path';
import ConvertAPI from 'convertapi';
import axios from 'axios';
import { Injectable } from '@nestjs/common';


@Injectable()
export class PdfService {
  private readonly pdfShiftUrl = 'https://api.pdfshift.io/v3/convert/pdf';

  private readonly directoryPath = path.join(__dirname, '..', 'files'); // Change 'files' to your desired folder
  constructor() {
    if (!fs.existsSync(this.directoryPath)) {
      fs.mkdirSync(this.directoryPath);
    }
  }


}
