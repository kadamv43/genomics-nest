// src/invoices/dto/create-invoice.dto.ts
import { PartialType } from '@nestjs/mapped-types';

export class CreateInvoiceDto {
  invoice_number: string;
  readonly appointment: string;
  readonly patient: string;
  readonly doctor: string;
  readonly total_amount: number;
  readonly paid: number;
  readonly balance: number;
  readonly discount: number;
  readonly payment_mode: string;
  received_by: string;
  file?: string;
  old_invoice?: string;
  balance_paid?: boolean;
  readonly particulars: { name: string; price: number }[];
}
