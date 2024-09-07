
import * as path from 'path';
import { createPdf } from '@saemhco/nestjs-html-pdf';
import * as puppeteer from 'puppeteer-core';
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

  async generatePdf(data: any) {
    const filePath = path.join(process.cwd(), 'templates', 'invoice.hbs');
    const options = {
      executablePath: '/home/graceful/wkhtmltopdf', // Path to your custom wkhtmltopdf binary
      format: 'A4',
    };
    return createPdf(filePath, options, data);
  }

  async generatePdf2(data: any) {
    // Step 1: Load the Handlebars template
    // return "ssss";
   

    const templatePath = path.join(process.cwd(), 'uploads', 'invoice.hbs');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHtml);

    // Step 2: Generate the HTML from the template with the provided data
    const html = template(data);

    // return html;

    // Step 3: Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();
    return pdfBuffer;
  }

  async generatePdf3(data): Promise<Buffer> {
    const apiKey = 'sk_b543d4f951ac3b41b4781a2e1cf2bf18495cb4e2'; // Replace with your actual PDFShift API key

    const templatePath = path.join(process.cwd(), 'templates', 'invoice.hbs');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHtml);

    // Step 2: Generate the HTML from the template with the provided data
    const html = template(data);

    try {
      const response = await axios.post(
        this.pdfShiftUrl,
        {
          source: html,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Basic YXBpOnNrXzllYjQ3ZTgzYTBjZTE0OGMxOGE0NjM1NzljYmQ4NzRhMmMxOGUzMWM=',
          },
          responseType: 'arraybuffer', // Ensure you get the PDF as a binary response
        },
      );
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Error converting HTML to PDF: ${error.message}`);
    }
  }

  async saveHtmlFile(data) {

     console.log('eee');
    const templatePath = path.join(process.cwd(), 'templates', 'invoice.hbs');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHtml);

    // Step 2: Generate the HTML from the template with the provided data
    const html = template(data);
    const filePath = path.join(process.cwd(), 'public/assets/uploads/', 'index.html');
    await fs.writeFileSync(filePath, html, 'utf8');
    return 'assets/uploads/index.html';

  }
}
