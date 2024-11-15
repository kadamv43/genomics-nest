import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice,InvoiceSchema } from './invoice.schema';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { AppointmentsModule } from 'src/appointments/appointments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    AppointmentsModule
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, AppointmentsService],
  exports: [MongooseModule],
})
export class InvoiceModule {}
