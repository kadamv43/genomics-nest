import { Controller, Get, Post } from '@nestjs/common';
import { AppConfigService } from './app-config.service';

@Controller('app-config')
export class AppConfigController {
  constructor(private configService: AppConfigService) {}

  @Post()
  createConfig() {
    // return ["ss"]
    return this.configService.createConfig();
  }

  @Get()
  getConfig() {
    // return ["ss"]
    return this.configService.findAll();
  }
}
