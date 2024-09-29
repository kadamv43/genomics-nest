import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { Patient, PatientDocument } from 'src/patients/patients.schema';
import { Doctor } from 'src/doctors/doctor.schema';
import { Product } from 'src/products/product.schema';
import { CreateAppointmentWebDto } from './dto/create-appointment-web.dto';

@Injectable()
export class AppointmentsService {
  private readonly prefix = 'GENOMICS-';

  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
  ) {}

  async create(createAppointmentDto: Appointment): Promise<Appointment> {
    const createdAppointment = new this.appointmentModel(createAppointmentDto);
    return createdAppointment.save();
  }

  async createFromWeb(
    createAppointmentDto: CreateAppointmentWebDto,
  ): Promise<Appointment> {
    const createdAppointment = new this.appointmentModel(createAppointmentDto);
    return createdAppointment.save();
  }

  async findAll(params) {
    console.log(params);
    const searchQuery = params.q ? { $regex: params.q, $options: 'i' } : null;
    console.log("search",searchQuery)

    const size = params.size;
    const skip = params.page * params.size;

    delete params.size;
    delete params.page;
    delete params.q

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

    const queryM =  this.appointmentModel
      .find(params)
      .populate({
        path: 'patient',
        match: searchQuery
          ? {
              $or: [
                { first_name: searchQuery },
                { last_name: searchQuery },
                { patient_number: searchQuery },
                { mobile: searchQuery },
                // { _id: params.q },
              ],
            }
          : {},
      })
      .populate('doctor')
      .sort({ created_at: 'desc' })
      .skip(skip)
      .limit(size)
      // .exec();

    // Log the raw query for debugging
    console.log('Raw Query:', queryM.getQuery());
    console.log('Query Options:', queryM.getOptions());
    console.log('Full Query String:', queryM.toString());

    // Execute the query
    const appointments = await queryM.exec();
    console.log(appointments.length);

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

  async addFilesToAppointment(
    id: string,
    file: string,
    file_name: string,
  ): Promise<Appointment> {
    let file_type = file.endsWith('.pdf') ? 'pdf' : 'image';

    return this.appointmentModel
      .findByIdAndUpdate(
        id,
        {
          $addToSet: { files: { file_name, file, file_type } },
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
