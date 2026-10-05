import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { ActionLogsService } from './action-logs.service';

// Read-only on purpose: audit records can't be edited or deleted through the API.
@Controller('action-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionLogsController {
  constructor(private readonly actionLogsService: ActionLogsService) {}

  @Get()
  @Roles(Role.Admin, Role.SuperAdmin)
  findAll(@Query() query: Record<string, any>) {
    return this.actionLogsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  findOne(@Param('id') id: string) {
    return this.actionLogsService.findOne(id);
  }
}
