import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from './doctor.schema';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const createdDoctor = new this.doctorModel(createDoctorDto);
    return createdDoctor.save();
  }

  async findAll(): Promise<Doctor[]> {
    return this.doctorModel.find().exec();
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorModel.findById(id).exec();
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async findBy(query: Record<string, any>): Promise<Doctor> {
    return this.doctorModel.findOne(query).exec();
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const updatedDoctor = await this.doctorModel
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
    const result = await this.doctorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
  }
}
