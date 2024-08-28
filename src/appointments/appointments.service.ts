import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async findAll(params) {

     const size = params.size;
     const skip = params.page * params.size;

     delete params.size;
     delete params.page;


    if (params.from && params.to) {
      const startDate = new Date(params.from);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(params.to);
      endDate.setHours(23, 59, 59, 999);
      params['created_at'] = {
        $gte: startDate,
        $lte: endDate,
      };

      delete params['from'];
      delete params['to'];
    } else {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      params['created_at'] = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }


    const appointments = await this.appointmentModel
      .find(params)
      .populate('patient')
      .populate('doctor')
      .sort({ created_at: 'desc' })
      .skip(skip).limit(size)
      .exec();

      console.log(appointments.length)

      const totalRecords = await this.appointmentModel
        .countDocuments(params)
        .exec();
      return { data: appointments, total: totalRecords };
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
      ...appointment.toObject(),
    };
  }


  async update(
    id: string,
    updateAppointmentDto: Appointment,
  ): Promise<Appointment> {
    return this.appointmentModel
      .findByIdAndUpdate(id, updateAppointmentDto, { new: true })
      .exec();
  }

  async addFilesToAppointment(id: string, file: string): Promise<Appointment> {
    return this.appointmentModel
      .findByIdAndUpdate(
        id,
        {
          $addToSet: { files: file },
        },
        { new: true }, // Returns the updated document
      )
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
