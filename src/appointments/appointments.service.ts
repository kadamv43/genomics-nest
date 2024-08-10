import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { Patient, PatientDocument } from 'src/patients/patients.schema';
import { Doctor } from 'src/doctors/doctor.schema';
import { Product } from 'src/products/product.schema';

@Injectable()
export class AppointmentsService {
  private readonly prefix = 'GENOMICS-';

  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>, // Inject PatientModel
  ) {}

  async create(createAppointmentDto: Appointment): Promise<Appointment> {
    const createdAppointment = new this.appointmentModel(createAppointmentDto);
    return createdAppointment.save();
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel
      .find()
      .populate('patient')
      .populate('doctor')
      .exec();
  }

  async findOne(id: string): Promise<any> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('patient')
      .populate('doctor')
      .populate('services')
      .exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return {
      ...appointment.toObject()
    };
  }

  async findBy(query: Record<string, any>): Promise<Appointment[]> {
    return this.appointmentModel
      .find(query)
      .populate('patient')
      .populate('doctor')
      .populate('services')
      .exec();
  }

  async update(
    id: string,
    updateAppointmentDto: Appointment,
  ): Promise<Appointment> {
    return this.appointmentModel
      .findByIdAndUpdate(id, updateAppointmentDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Appointment> {
    return this.appointmentModel.findByIdAndDelete(id).exec();
  }

  async generateUniqueAppointmentNumber(): Promise<string> {
    const lastAppointment = await this.appointmentModel
      .findOne()
      .sort({ appointment_number: -1 })
      .exec();
    let lastNumber = 0;

    if (lastAppointment) {
      const lastNumberString = lastAppointment.appointment_number?.replace(
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
