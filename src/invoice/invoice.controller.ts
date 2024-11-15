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
  UseGuards,
  Req,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice } from './invoice.schema';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AppointmentsService } from 'src/appointments/appointments.service';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoicesService: InvoiceService,
    private readonly appointmentService: AppointmentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: any,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ): Promise<Invoice> {
    console.log(req.user);
    createInvoiceDto.invoice_number =
      await this.invoicesService.generateUniqueInvoiceNumber();
    createInvoiceDto.received_by = `${req.user?.first_name}  ${req.user?.last_name}`;
    const invoice: any = await this.invoicesService.create(createInvoiceDto);
    await this.appointmentService.update(invoice?.appointment, {
      invoice: invoice?._id,
    });
    return invoice;
  }

  @Get()
  findAll(@Query() query: Record<string, any>) {
    return this.invoicesService.findAll(query);
  }

  @Get('pre-post-charges')
  prePostCharges() {
    return [
      { name: 'Post check up charges', code: 'Post check up charges' },
      { name: 'Pre Hysteroscopy charges', code: 'Pre Hysteroscopy charges' },
      { name: 'Post Hysteroscopy charges', code: 'Post Hysteroscopy charges' },
      { name: 'Pre laproscopy charges', code: 'Pre laproscopy charges' },
      { name: 'Post laproscopy charges', code: 'Post laproscopy charges' },
      { name: 'Pre Opu charges', code: 'Pre Opu charges' },
      { name: 'Post Opu charges', code: 'Post Opu charges' },
      { name: 'Pre FET charges', code: 'Pre FET charges' },
      { name: 'Post FET charges', code: 'Post FET charges' },
      {
        name: 'Post Os Tightening charges',
        code: 'Post Os Tightening charges',
      },
      { name: 'IVF charges', code: 'IVF charges' },
      { name: 'IUI charges', code: 'Pre IUI charges' },
      { name: 'Post IUI charges', code: 'Post IUI charges' },
    ];
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Invoice> {
    console.log(id);
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
