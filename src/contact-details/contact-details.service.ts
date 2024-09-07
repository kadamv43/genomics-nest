import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactDetail, ContactDetailDocument } from './contact-detail.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateContactDetailDto } from './dto/create-contact-details.dto';
import { UpdateContactDetailDto } from './dto/update-contact-details.dto';

@Injectable()
export class ContactDetailsService {
  constructor(
    @InjectModel(ContactDetail.name)
    private contactDetailModel: Model<ContactDetailDocument>,
  ) {}

  async create(
    createDoctorDto: CreateContactDetailDto,
  ): Promise<ContactDetail> {
    const createdDoctor = new this.contactDetailModel(createDoctorDto);
    return createdDoctor.save();
  }

  async findAll() {
    return await this.contactDetailModel.find().exec();
  }

  async findOne(id: string): Promise<ContactDetail> {
    const doctor = await this.contactDetailModel.findById(id).exec();
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async findBy(query: Record<string, any>): Promise<ContactDetail[]> {
    return this.contactDetailModel.find(query).exec();
  }

  async update(
    id: string,
    updateDoctorDto: UpdateContactDetailDto,
  ): Promise<ContactDetail> {
    const updatedDoctor = await this.contactDetailModel
      .findByIdAndUpdate(id, updateDoctorDto, {
        new: true,
      })
      .exec();
    if (!updatedDoctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return updatedDoctor;
  }

  async remove(id: string): Promise<void> {
    const result = await this.contactDetailModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
  }
}
