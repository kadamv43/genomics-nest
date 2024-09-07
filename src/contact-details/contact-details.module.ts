import { Module } from '@nestjs/common';
import { ContactDetailsController } from './contact-details.controller';
import { ContactDetailsService } from './contact-details.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactDetail, ContactDetailSchema } from './contact-detail.schema';

@Module({
  imports:[
     MongooseModule.forFeature([{ name: ContactDetail.name, schema: ContactDetailSchema }]),
  ],
  controllers: [ContactDetailsController],
  providers: [ContactDetailsService]
})
export class ContactDetailsModule {}
