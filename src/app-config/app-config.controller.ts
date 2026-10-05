import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AppConfigService } from './app-config.service';

@Controller('app-config')
export class AppConfigController {
  constructor(private configService: AppConfigService) {}

  @UseGuards(JwtAuthGuard)
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
