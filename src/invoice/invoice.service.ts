// src/invoices/invoices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  private readonly prefix = 'INVOICE-';
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    console.log(createInvoiceDto);
    await this.deleteManyByQuery({ appointment: createInvoiceDto.appointment });
    const newInvoice = new this.invoiceModel(createInvoiceDto);
    return await newInvoice.save();
  }

  async findAll(params) {
    const size = params.size;
    const skip = params.page * params.size;
    const invoices = await this.invoiceModel
      .find()
      .populate('appointment')
      .populate('patient')
      .populate('doctor')
      .skip(skip)
      .limit(size)
      .exec();
    const totalRecords = await this.invoiceModel.countDocuments().exec();
    return { data: invoices, total: totalRecords };
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(id)
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
    return this.invoiceModel.find(query).exec();
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
}
