// src/patients/patients.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient } from './patients.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
@Injectable()
export class PatientsService {
  prefix = 'PATIENT-';
  constructor(
    @InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const { mobile } = createPatientDto;
    const existingPatient = await this.patientModel.findOne({ mobile }).exec();

    console.log('ex', existingPatient);

    if (existingPatient) {
      return existingPatient;
    }
    createPatientDto.patient_number = await this.generateUniquePatientNumber();
    const createdPatient = new this.patientModel(createPatientDto);
    return createdPatient.save();
  }

  async findAll(params) {
    const size = params.size;
    const exportExcel = params.export;
    const skip = params.page * params.size;

    let query = {};
    if (params.q) {
      const regex = new RegExp(params.q, 'i'); // 'i' makes it case-insensitive

      query = {
        $or: [
          { patient_number: !isNaN(params.q) ? Number(params.q) : 0 },
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { email: { $regex: regex } },
          { mobile: { $regex: regex } },
        ],
      };
    }

    let queryBuilder = this.patientModel
      .find(query)
      .sort({ patient_number: 'desc' });

    if (!exportExcel) {
      queryBuilder = queryBuilder.skip(skip).limit(size);
    }

    const patients = await queryBuilder.exec();
    const totalRecords = await this.patientModel.countDocuments(query).exec();
    return { data: patients, total: totalRecords };
  }

  async addFilesToAppointment(
    id: string,
    file: string,
    file_name: string,
  ): Promise<Patient> {
    let file_type = file.endsWith('.pdf') ? 'pdf' : 'image';
    const timestamp = Math.floor(Date.now() / 1000);

    return this.patientModel
      .findByIdAndUpdate(
        id,
        {
          $addToSet: { files: { id: timestamp, file_name, file, file_type } },
        },
        { new: true }, // Returns the updated document
      )
      .exec();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientModel.findById(id).exec();
    if (!patient) {
      throw new NotFoundException(`Patient #${id} not found`);
    }
    return patient;
  }

  async findBy(query: Record<string, any>): Promise<Patient[]> {
    return this.patientModel.find(query).exec();
  }

  async findByOne(query: Record<string, any>): Promise<Patient> {
    return this.patientModel.findOne(query).exec();
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const existingPatient = await this.patientModel
      .findByIdAndUpdate(id, updatePatientDto, { new: true })
      .exec();
    if (!existingPatient) {
      throw new NotFoundException(`Patient #${id} not found`);
    }
    return existingPatient;
  }

  async insertData(data: any[]): Promise<any> {
    try {
      const insertedData = await this.patientModel.insertMany(data);
      return { message: 'Data inserted successfully', insertedData };
    } catch (error) {
      throw new Error(`Failed to insert data: ${error.message}`);
    }
  }

  async removeReport(id: string, image_id: number): Promise<Patient> {
    console.log('app', id);
    console.log('img', image_id);
    let appointment = await this.patientModel.findById(id).exec();
    let files = appointment.files.filter((item: any) => {
      return item.id != image_id;
    });

    console.log('files', files);
    return this.patientModel
      .findByIdAndUpdate(
        id,
        {
          files,
        },
        { new: true }, // Returns the updated document
      )
      .exec();
  }

  async remove(id: string): Promise<Patient> {
    const deletedPatient = await this.patientModel.findByIdAndDelete(id).exec();
    if (!deletedPatient) {
      throw new NotFoundException(`Patient #${id} not found`);
    }
    return deletedPatient;
  }

  async globalSearch(query: string): Promise<Patient[]> {
    const searchRegex = new RegExp(query, 'i'); // 'i' makes it case insensitive
    return this.patientModel
      .find({
        $or: [
          { first_name: searchRegex },
          { last_name: searchRegex },
          { email: searchRegex },
          // { patient_number: searchRegex },
          // { mobile: searchRegex },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$patient_number' }, // Convert number to string
                regex: searchRegex,
              },
            },
          },
        ],
      })
      .exec();
  }

  async generateUniquePatientNumber(): Promise<string> {
    const lastPatient = await this.patientModel
      .findOne()
      .sort({ patient_number: -1 })
      .exec();

    console.log(lastPatient);
    let lastNumber = 0;

    if (lastPatient && lastPatient?.patient_number) {
      lastNumber = lastPatient.patient_number;
      // lastNumber = parseInt(lastNumberString);
    }

    const nextNumber = lastNumber + 1;
    // const paddedNumber = nextNumber.toString().padStart(7, '0'); // Adjust length as needed
    return `${nextNumber}`;
  }

  async importData(jsonData) {
    for (const data of jsonData) {
      let patienNumber = await this.generateUniquePatientNumber();
      const item = new this.patientModel({
        patient_number: patienNumber,
        first_name: data['first_name'],
        last_name: data['last_name'],
        mobile: data['mobile'],
        age: data['age'],
        reference_by: data['reference_by'],
      });
      await item.save();
    }
  }
}
