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
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice } from './invoice.schema';
import { query, Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmailService } from 'src/email/email.service';

// Every invoice route (reads and writes) requires a logged-in user.
@UseGuards(JwtAuthGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoicesService: InvoiceService,
    private readonly appointmentService: AppointmentsService,
    private emailService: EmailService,
  ) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ): Promise<Invoice> {
    this.validateInvoiceAmounts(createInvoiceDto);

    console.log(req.user);
    createInvoiceDto.invoice_number =
      await this.invoicesService.generateUniqueInvoiceNumber();
    createInvoiceDto.received_by = `${req.user?.first_name}  ${req.user?.last_name}`;
    const invoice: any = await this.invoicesService.create(createInvoiceDto);
    await this.appointmentService.update(invoice?.appointment, {
      invoice: invoice?._id,
    });

    if (invoice) {
      let data = await this.invoicesService.findOne(invoice?._id);
      console.log(data);
      let subject = `New Invoice Created (${data.invoice_number})`;
      let newData = this.modifyData(data);
      this.emailService
        .sendMailTemplateToAdmin(subject, newData, './create_invoice')
        .catch((e) => {
          console.error(e);
        });
    }
    return invoice;
  }

  @Post('balance')
  async createBalance(
    @Req() req: any,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ): Promise<Invoice> {
    if (!createInvoiceDto.old_invoice) {
      throw new BadRequestException('A pending invoice reference is required.');
    }

    const originalInvoice: any = await this.invoicesService.findOne(
      createInvoiceDto.old_invoice,
    );
    const pendingAmount = Number(originalInvoice.balance) - Number(createInvoiceDto.discount ?? 0);

    if (
      originalInvoice.balance_paid ||
      pendingAmount <= 0 ||
      !this.amountsMatch(createInvoiceDto.total_amount, originalInvoice.balance) ||
      !this.amountsMatch(createInvoiceDto.paid, pendingAmount) ||
      !this.amountsMatch(createInvoiceDto.balance, 0)
    ) {
      throw new BadRequestException('Payment must exactly match the pending invoice amount.');
    }

    this.validatePaymentModes(createInvoiceDto, true);
    createInvoiceDto.invoice_number =
      await this.invoicesService.generateUniqueInvoiceNumber();
    createInvoiceDto.received_by = `${req.user?.first_name}  ${req.user?.last_name}`;
    const invoice: any = await this.invoicesService.create(createInvoiceDto);
    await this.appointmentService.update(invoice?.appointment, {
      balance_invoice: invoice?._id,
    });

    await this.invoicesService.update(createInvoiceDto?.old_invoice, {
      balance_paid: true,
    });

    if (invoice) {
      let data = await this.invoicesService.findOne(invoice?._id);
      console.log(data);
      let subject = `New Invoice Created (${data.invoice_number})`;
      let newData = this.modifyData(data);
      this.emailService
        .sendMailTemplateToAdmin(subject, newData, './create_invoice')
        .catch((e) => {
          console.error(e);
        });
    }
    return invoice;
  }

  @Get()
  findAll(@Query() query: Record<string, any>) {
    return this.invoicesService.findAll(query);
  }

  @Get('pending-invoices')
  getPendingInvoices() {
    return this.invoicesService.findBy({ balance_paid: false });
  }

  @Get('by-patient/:patientId')
  getByPatient(@Param('patientId') patientId: string) {
    return this.invoicesService.findBy({ patient: patientId });
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

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updatePartial(
    @Param('id') id: string,
    @Query() query: Record<string, any>,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<Invoice> {
    if (file) {
      updateInvoiceDto.file = 'invoice/' + file.filename;
    }

    const existingInvoice: any = await this.invoicesService.findOne(id);
    const updatedValues = {
      ...(existingInvoice.toObject?.() ?? existingInvoice),
      ...updateInvoiceDto,
    };
    const financialFields = [
      'total_amount',
      'paid',
      'balance',
      'discount',
      'payment_mode1',
      'payment_mode2',
      'partial_payment',
      'already_paid',
    ];

    if (financialFields.some((field) => field in updateInvoiceDto)) {
      this.validateInvoiceAmounts(updatedValues);
    }

    const res = await this.invoicesService.update(id, updateInvoiceDto);

    if (res) {
      let data = await this.invoicesService.findOne(id);
      console.log(data);
      let subject = `Invoice Updated (${data.invoice_number})`;
      let newData = this.modifyData(data);
      this.emailService
        .sendMailTemplateToAdmin(subject, newData, './edit_invoice')
        .catch((e) => {
          console.error(e);
        });
    }

    if (query.send == 'whatsapp') {
      await this.invoicesService.sendFile(id, req);
    }
    return res;
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.invoicesService.remove(id);
  }

  modifyData(data) {
    let newData = {};
    newData['invoice_number'] = data?.invoice_number;
    newData['total_amount'] = data?.total_amount;
    newData['paid'] = data?.paid;
    newData['balance'] = data?.balance;
    newData['discount'] = data?.discount;
    newData['received_by'] = data?.received_by;
    newData['patient'] =
      data?.patient?.first_name + ' ' + data?.patient?.last_name;
    newData['opd_no'] = data?.patient?.patient_number;
    return newData;
  }

  private validateInvoiceAmounts(invoice: any): void {
    const total = Number(invoice.total_amount);
    const discount = Number(invoice.discount ?? 0);
    const paid = Number(invoice.paid);
    const balance = Number(invoice.balance);
    const payableAmount = total - discount;

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(discount) ||
      !Number.isFinite(paid) ||
      !Number.isFinite(balance) ||
      total <= 0 ||
      discount < 0 ||
      discount > total ||
      paid < 0 ||
      paid > payableAmount ||
      !this.amountsMatch(balance, payableAmount - paid)
    ) {
      throw new BadRequestException('Invoice amounts are invalid.');
    }

    this.validatePaymentModes(invoice, Boolean(invoice.already_paid));
  }

  private validatePaymentModes(invoice: any, requirePayment: boolean): void {
    if (invoice.already_paid) {
      if (!invoice.old_invoice) {
        throw new BadRequestException('Select the invoice where the amount was already paid.');
      }
      return;
    }

    const paymentModes = [invoice.payment_mode1, invoice.payment_mode2].filter(
      (paymentMode) => paymentMode?.mode,
    );
    const paid = Number(invoice.paid);

    if (!paymentModes.length) {
      throw new BadRequestException('A payment method is required.');
    }

    const hasImmediatePayment = paymentModes.some(
      (paymentMode) => paymentMode.mode !== 'Pay Later',
    );
    const paymentTotal = paymentModes.reduce(
      (total, paymentMode) => total + Number(paymentMode.price),
      0,
    );

    if (
      paymentModes.some(
        (paymentMode) =>
          !Number.isFinite(Number(paymentMode.price)) ||
          Number(paymentMode.price) < 0 ||
          (paymentMode.mode === 'Pay Later' && Number(paymentMode.price) !== 0),
      ) ||
      (hasImmediatePayment && paid <= 0) ||
      (!hasImmediatePayment && paid !== 0) ||
      (requirePayment && !hasImmediatePayment) ||
      !this.amountsMatch(paymentTotal, paid)
    ) {
      throw new BadRequestException('Payment method amounts must match the paid amount.');
    }
  }

  private amountsMatch(firstAmount: any, secondAmount: any): boolean {
    return Math.abs(Number(firstAmount) - Number(secondAmount)) < 0.01;
  }
}
