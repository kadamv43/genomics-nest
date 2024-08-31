// src/invoices/invoices.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice } from './invoice.schema';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoicesService: InvoiceService) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    createInvoiceDto.invoice_number =
      await this.invoicesService.generateUniqueInvoiceNumber();
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  findAll(@Query() query: Record<string, any>) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.invoicesService.remove(id);
  }
}
