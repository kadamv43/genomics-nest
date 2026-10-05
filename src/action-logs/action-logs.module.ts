import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionLog, ActionLogSchema } from './action-log.schema';
import { ActionLogsController } from './action-logs.controller';
import { ActionLogsInterceptor } from './action-logs.interceptor';
import { ActionLogsService } from './action-logs.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ActionLog.name, schema: ActionLogSchema }]),
  ],
  controllers: [ActionLogsController],
  providers: [
    ActionLogsService,
    { provide: APP_INTERCEPTOR, useClass: ActionLogsInterceptor },
  ],
  exports: [ActionLogsService],
})
export class ActionLogsModule {}
