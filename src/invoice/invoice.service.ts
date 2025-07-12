// src/invoices/invoices.service.ts
import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';

@Injectable()
export class InvoiceService {
  private readonly prefix = 'INVOICE-';
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private httpService: HttpService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    console.log(createInvoiceDto);
    //await this.deleteManyByQuery({ appointment: createInvoiceDto.appointment });
    const newInvoice = new this.invoiceModel(createInvoiceDto);
    return await newInvoice.save();
  }

  async findAll(params) {
    const size = parseInt(params.size) || 10;
    const page = parseInt(params.page) || 0;
    const skip = page * size;

    const search = params.q?.trim();
    const regex = search ? new RegExp(search, 'i') : null;

    const pipeline: any[] = [];

    // Join appointment
    pipeline.push({
      $lookup: {
        from: 'appointments',
        localField: 'appointment',
        foreignField: '_id',
        as: 'appointment',
      },
    });

    pipeline.push({
      $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true },
    });

    // Join patient
    pipeline.push({
      $lookup: {
        from: 'patients',
        localField: 'patient',
        foreignField: '_id',
        as: 'patient',
      },
    });

    pipeline.push({
      $unwind: { path: '$patient', preserveNullAndEmptyArrays: true },
    });

    // Join doctor (optional)
    pipeline.push({
      $lookup: {
        from: 'doctors',
        localField: 'doctor',
        foreignField: '_id',
        as: 'doctor',
      },
    });

    pipeline.push({
      $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true },
    });

    // If search query exists
    if (regex) {
      pipeline.push({
        $match: {
          $or: [
            { invoice_number: { $regex: regex } },
            { 'appointment.appointment_number': { $regex: regex } },
            { 'patient.first_name': { $regex: regex } },
            { 'patient.last_name': { $regex: regex } },
            // Add more fields if needed
          ],
        },
      });
    }

    // Total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalCountResult = await this.invoiceModel.aggregate(countPipeline);
    const total = totalCountResult[0]?.total || 0;

    // Pagination & Sorting
    pipeline.push({ $sort: { created_at: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: size });

    const data = await this.invoiceModel.aggregate(pipeline);

    return { data, total };
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate('old_invoice')
      .populate('doctor')
      .populate('patient')
      .exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateInvoiceDto, { new: true })
      .exec();
    if (!updatedInvoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return updatedInvoice;
  }

  async remove(id: string): Promise<void> {
    const result = await this.invoiceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
  }

  async findBy(query: Record<string, any>): Promise<Invoice[]> {
    return this.invoiceModel
      .find(query)
      .populate('appointment')
      .populate('patient')
      .populate('doctor')
      .exec();
  }

  async deleteManyByQuery(
    query: Record<string, any>,
  ): Promise<{ deletedCount?: number }> {
    return this.invoiceModel.deleteMany(query).exec();
  }

  async generateUniqueInvoiceNumber(): Promise<string> {
    const lastAppointment = await this.invoiceModel
      .findOne()
      .sort({ invoice_number: -1 })
      .exec();
    let lastNumber = 0;

    if (lastAppointment) {
      const lastNumberString = lastAppointment.invoice_number?.replace(
        this.prefix,
        '',
      );
      lastNumber = parseInt(lastNumberString, 10);
    }

    const nextNumber = lastNumber + 1;
    const paddedNumber = nextNumber.toString().padStart(7, '0'); // Adjust length as needed
    return `${this.prefix}${paddedNumber}`;
  }

  async sendFile(invoiceId: string, req: Request) {
    const domain = `${req.protocol}://${req.get('host')}`;
    console.log(domain);

    const invoice = await this.invoiceModel
      .findById(invoiceId)
      .populate('patient')
      .exec();

    const payload = {
      integrated_number: process.env.WHATSAPP_NUMBER,
      content_type: 'template',
      payload: {
        messaging_product: 'whatsapp',
        type: 'template',
        template: {
          name: 'invoice',
          language: {
            code: 'en',
            policy: 'deterministic',
          },
          namespace: 'ece4ae9f_6e63_4812_9468_c1b47649f31b',
          to_and_components: [
            {
              to: [invoice?.patient?.mobile],
              components: {
                header_1: {
                  type: 'document',
                  value: `${domain}/uploads/${invoice?.file}`,
                  filename: 'invoice.pdf',
                },
              },
            },
          ],
        },
      },
    };
    const url = process.env.WHATSAPP_API;

    try {
      const headers = {
        authkey: process.env.WHATSAPP_API_KEY, // Add your authorization token if needed
        'Content-Type': 'application/json', // Content type for JSON
      };

      this.httpService.post(url, payload, { headers }).subscribe({
        next: () => {
          return { message: 'OTP sent Successfully', data: [] };
        },
        error: (err) => {
          return { message: 'error', data: err };
        },
      });

      // return response.data; // Return the data from the API response
    } catch (error) {
      // Handle errors here
      console.error('Error making POST request', error);
      throw error;
    }
  }
}
