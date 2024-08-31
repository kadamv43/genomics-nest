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
  readonly received_by: string;
  readonly particulars: { name: string; price: number }[];
}

// src/invoices/dto/update-invoice.dto.ts


export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}
