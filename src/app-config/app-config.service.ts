import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppConfig } from './app-config.schema';

@Injectable()
export class AppConfigService {
  constructor(
    @InjectModel('AppConfig') private readonly AppConfigModel: Model<AppConfig>,
  ) {}

  async findAll() {
    console.log('here');
    return await this.AppConfigModel.find().exec();
  }

  async createConfig() {
    console.log('here');
    return await this.AppConfigModel.create({
      discount_limit: 2000,
      invoice_generate_otp:true
    });
  }
}
