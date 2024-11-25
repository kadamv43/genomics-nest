import { Module } from '@nestjs/common';
import { AppConfigController } from './app-config.controller';
import { AppConfigService } from './app-config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig, AppConfigSchema } from './app-config.schema';

@Module({
  controllers: [AppConfigController],
  providers: [AppConfigService],
  imports: [
    MongooseModule.forFeature([
      { name: AppConfig.name, schema: AppConfigSchema },
    ]),
  ],
})
export class AppConfigModule {}
